import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

/**
 * Yanıttaki Prisma.Decimal değerlerini number'a çevirir.
 *
 * Neden gerekli: Decimal.toJSON() string döndürür, yani `balanceTL` istemciye
 * "9000" olarak giderdi. Frontend her yerde `balance.toLocaleString("tr-TR",
 * {...})` çağırıyor; string üzerinde bu çağrı hata vermez ama biçimlendirmeyi
 * sessizce atlar ve "₺9.000,00" yerine "₺9000" yazar. Sessiz bozulma yerine
 * sınırda tek bir yerde dönüştürüyoruz.
 *
 * Hassasiyet kaybı yok: kesin aritmetik veritabanında ve serviste Decimal ile
 * yapılır; number'a çevrim yalnızca gösterim içindir ve bu büyüklükler
 * IEEE-754 double'da güvenle temsil edilir.
 */
@Injectable()
export class DecimalSerializerInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => convert(data)));
  }
}

function convert(value: unknown, depth = 0): unknown {
  // Kendine referans veren yapılarda sonsuz döngüye girmemek için.
  if (depth > 12) return value;

  if (value === null || value === undefined) return value;

  if (Prisma.Decimal.isDecimal(value)) {
    return (value as Prisma.Decimal).toNumber();
  }

  // Date ve Buffer gibi tipler olduğu gibi kalmalı.
  if (value instanceof Date || Buffer.isBuffer(value)) return value;

  if (Array.isArray(value)) {
    return value.map((item) => convert(item, depth + 1));
  }

  if (typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = convert(val, depth + 1);
    }
    return out;
  }

  // Prisma model nesneleri düz obje olarak gelir; buraya düşen diğer sınıf
  // örnekleri (ör. custom response sınıfları) dokunulmadan geçer.
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = convert(val, depth + 1);
    }
    return out;
  }

  return value;
}
