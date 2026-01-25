import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compression = require("compression");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet());
  
  // Compression
  app.use(compression());

  // CORS
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://zeytin-psi.vercel.app", // Vercel adresim
      "https://zeytin-saas.vercel.app", // Yedek (proje adı)
    ],
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

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
