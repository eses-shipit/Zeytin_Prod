import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { json, urlencoded } from "express";
import helmet from "helmet";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { ErrorReporterService } from "./common/error-reporter.service";
import { DecimalSerializerInterceptor } from "./common/interceptors/decimal-serializer.interceptor";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compression = require("compression");

/**
 * İstek gövdesi üst sınırı.
 *
 * Bu API yalnızca JSON kayıt verisi alır (fiş, müşteri, üretim partisi); dosya
 * veya görsel yüklemesi yoktur. En büyük gövde birkaç kB'dir. 256kB, en geniş
 * toplu isteğe bile fazlasıyla yeter ama Express'in varsayılan 100kB'ına takılma
 * riskini bırakmaz. Sınırı yüksek tutmak bellek tüketen gövdelerle ucuz DoS
 * yüzeyi açar.
 */
const BODY_LIMIT = "256kb";

/**
 * CORS izin listesini FRONTEND_URL'den okur (virgülle ayrılmış olabilir).
 *
 * Liste eskiden kod içinde sabitti ve localhost:3000/3001 içeriyordu; yani canlı
 * ortam da geliştirici makinesinden gelen kimlik bilgili istekleri kabul ediyordu.
 * `credentials: true` ile birlikte bu, saldırganın localhost'ta çalıştırdığı
 * sayfanın canlı API'ye oturumlu istek atabilmesi demekti.
 */
function resolveCorsOrigins(isProduction: boolean): string[] {
  const origins = (process.env.FRONTEND_URL ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, "")) // sondaki '/' Origin başlığında yok
    .filter((origin) => origin.length > 0);

  if (!isProduction) return origins;

  // Canlıda localhost asla kabul edilmez; yanlışlıkla env'e girse bile elenir.
  return origins.filter((origin) => {
    try {
      const { hostname } = new URL(origin);
      return hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "[::1]";
    } catch {
      return false;
    }
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Gövde ayrıştırıcıyı aşağıda sınırla birlikte kendimiz kuruyoruz.
    bodyParser: false,
  });
  const logger = new Logger("Bootstrap");
  const isProduction = process.env.NODE_ENV === "production";

  /**
   * Proxy arkasında (Vercel/Render) istemci IP'si X-Forwarded-For'dan okunur.
   * ThrottlerGuard hız limitini IP'ye göre uygular; `trust proxy` kapalıyken tüm
   * istekler proxy'nin tek IP'sinden gelmiş görünür ve limit ya herkesi birlikte
   * kilitler ya da anlamsızlaşır.
   *
   * Değer olarak `true` KULLANILMAZ: o durumda Express, X-Forwarded-For'un en
   * soldaki değerini olduğu gibi kabul eder ve istemci başlığı kendisi
   * göndererek IP'sini istediği gibi uydurup limiti atlayabilir. `1`, "yalnızca
   * en yakın tek proxy'ye güven" demektir; platformun eklediği son atlama
   * güvenilirdir, istemcinin uydurduğu önceki değerler yok sayılır. Önüne ek bir
   * proxy/CDN katmanı eklenirse bu sayı da artırılmalıdır.
   *
   * Yerelde proxy yoktur; orada güvenmek doğrudan gelen istemcinin başlığı
   * uydurmasına izin vermek olurdu.
   */
  app.set("trust proxy", isProduction ? 1 : false);

  // Security Headers
  app.use(helmet());

  // Compression
  app.use(compression());

  // Body parser (sınırlı)
  app.use(json({ limit: BODY_LIMIT }));
  app.use(urlencoded({ extended: true, limit: BODY_LIMIT }));

  // CORS
  const corsOrigins = resolveCorsOrigins(isProduction);
  if (corsOrigins.length === 0) {
    // Sessizce "her yere kapalı" duruma düşmek teşhisi zorlaştırır.
    logger.warn(
      "FRONTEND_URL geçerli bir origin içermiyor; CORS istekleri reddedilecek.",
    );
  }
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  });

  // Strict Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global hata filtresi: ham mesaj/stack ve Prisma ayrıntısı dışarı sızmaz.
  app.useGlobalFilters(new AllExceptionsFilter(new ErrorReporterService()));

  // Decimal alanları yanıtta number'a çevirir. Decimal.toJSON() string döndürür
  // ve frontend'in toLocaleString çağrıları sessizce biçimlendirmeyi atlardı.
  app.useGlobalInterceptors(new DecimalSerializerInterceptor());

  // SIGTERM/SIGINT'te Prisma bağlantısını temiz kapatır (onModuleDestroy).
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3001);
  logger.log(`API ${await app.getUrl()} adresinde. İzinli origin: ${corsOrigins.join(", ") || "(yok)"}`);
}
bootstrap();
