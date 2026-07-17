import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { ErrorReporterService } from "../error-reporter.service";

/** İstemciye dönen tek tip hata gövdesi. */
interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  requestId: string;
  path: string;
  timestamp: string;
}

/** Beklenmeyen her hata için istemcinin göreceği tek mesaj. */
const GENERIC_MESSAGE = "Beklenmeyen bir hata oluştu.";

/**
 * Global hata filtresi.
 *
 * Daha önce hiç filtre yoktu: yakalanmayan hatalar ham `message` ve stack trace
 * ile 500 olarak dönüyordu. Prisma hataları da (örn. P2002) kısıt/kolon adlarını
 * gövdeye yazarak şemayı sızdırıyordu.
 *
 * Kural: istemciye yalnızca sınıflandırılmış ve güvenli mesaj gider; tam ayrıntı
 * (kod, meta, stack) yalnızca sunucu log'una yazılır. İstek gövdesi ASLA
 * loglanmaz — parola ve TCKN içerir.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  // Opsiyonel: main.ts filtreyi kurarken enjekte eder. Yoksa bildirim atlanır.
  constructor(private readonly reporter?: ErrorReporterService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId = this.resolveRequestId(req);

    const { status, message, error, logDetail } = this.classify(exception);

    // Sunucu tarafı log: gövde yok, yalnızca yönlendirici bilgiler.
    const where = `${req.method} ${req.originalUrl}`;
    const stack = exception instanceof Error ? exception.stack : undefined;
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`[${requestId}] ${where} -> ${status} ${logDetail}`, stack);
      // Yalnızca beklenmeyen 5xx'ler harici izlemeye iletilir (PII'siz özet).
      this.reporter?.report({ requestId, method: req.method, path: req.originalUrl, status, detail: logDetail });
    } else {
      // 4xx beklenen durumdur; stack gürültü yaratır.
      this.logger.warn(`[${requestId}] ${where} -> ${status} ${logDetail}`);
    }

    const body: ErrorBody = {
      statusCode: status,
      message,
      ...(error ? { error } : {}),
      requestId,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    };

    res.status(status).json(body);
  }

  /**
   * Hatayı istemciye dönecek gövdeye ve log satırına ayırır.
   */
  private classify(exception: unknown): {
    status: number;
    message: string | string[];
    error?: string;
    logDetail: string;
  } {
    // HttpException (ValidationPipe, guard'lar, servisler) olduğu gibi geçer.
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === "string") {
        return { status, message: payload, logDetail: exception.name };
      }

      // ValidationPipe dizi hâlinde mesaj döner; bu yapı korunmalı.
      const obj = payload as { message?: string | string[]; error?: string };
      return {
        status,
        message: obj.message ?? exception.message,
        error: obj.error,
        logDetail: exception.name,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.classifyPrisma(exception);
    }

    // Prisma'nın diğer hata sınıfları (ValidationError, InitializationError)
    // mesajlarında şema/bağlantı ayrıntısı taşır; genel 500'e düşürülür.
    const logDetail =
      exception instanceof Error
        ? `${exception.name}: ${exception.message}`
        : `Bilinmeyen hata: ${String(exception)}`;

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: GENERIC_MESSAGE,
      logDetail,
    };
  }

  /**
   * Prisma hata kodlarını HTTP karşılıklarına çevirir.
   *
   * `meta` istemciye ASLA yazılmaz: kolon/tablo/kısıt adlarını içerir ve şemayı
   * sızdırır. Yalnızca log'a gider.
   */
  private classifyPrisma(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
    error?: string;
    logDetail: string;
  } {
    const meta = exception.meta ? ` meta=${JSON.stringify(exception.meta)}` : "";
    const logDetail = `Prisma ${exception.code}${meta}`;

    switch (exception.code) {
      // Unique kısıt ihlali. stock.service'teki yarış koşullu
      // kontrol-sonra-yaz yolları buraya düşer.
      case "P2002":
        return {
          status: HttpStatus.CONFLICT,
          message: "Bu kayıt zaten mevcut.",
          error: "Conflict",
          logDetail,
        };

      // Güncellenecek/silinecek kayıt yok.
      case "P2025":
        return {
          status: HttpStatus.NOT_FOUND,
          message: "Kayıt bulunamadı.",
          error: "Not Found",
          logDetail,
        };

      // Foreign key ihlali: bağlı kayıt var ya da referans geçersiz.
      case "P2003":
        return {
          status: HttpStatus.CONFLICT,
          message: "İlişkili kayıtlar olduğu için işlem tamamlanamadı.",
          error: "Conflict",
          logDetail,
        };

      default:
        // Sınıflandırılmamış Prisma kodu: mesajı sızdırmamak için genel 500.
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: GENERIC_MESSAGE,
          logDetail,
        };
    }
  }

  /**
   * İstek kimliği. `x-request-id` istemci kontrolündedir; log enjeksiyonuna
   * karşı karakter kümesi ve uzunluk sınırlanır, uymuyorsa yenisi üretilir.
   */
  private resolveRequestId(req: Request): string {
    const header = req.headers["x-request-id"];
    const value = Array.isArray(header) ? header[0] : header;

    if (typeof value === "string" && /^[A-Za-z0-9._-]{1,64}$/.test(value)) {
      return value;
    }

    return randomUUID();
  }
}
