import { MiddlewareConsumer, Module, NestModule, RequestMethod, Global } from "@nestjs/common";
import { ContextMiddleware } from "./common/context.middleware";
import { PrismaService } from "./prisma/prisma.service";
import { TicketsModule } from "./tickets/tickets.module";
import { CustomersModule } from "./customers/customers.module";
import { ProductionModule } from "./production/production.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { StockModule } from "./stock/stock.module";
import { ReportsModule } from "./reports/reports.module";
import { SmsModule } from "./sms/sms.module";
import { ProductsModule } from "./products/products.module";
import { IdGeneratorService } from "./common/id-generator.service";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { SupportModule } from "./support/support.module";
import { TenantModule } from "./tenant/tenant.module";
import { PolicyModule } from "./policy/policy.module";
import { LeadsModule } from "./leads/leads.module";
import { EmailVerificationModule } from "./verification/email-verification.module";
import { ConfigModule } from "@nestjs/config";

import { AuditModule } from "./audit/audit.module";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import * as Joi from "joi";
import { ContextService } from "./common/context.service";
import { TokenService } from "./common/token.service";
import { EmailService } from "./common/email.service";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

@Global() // ContextService, TokenService ve EmailService global
@Module({
  providers: [ContextService, TokenService, EmailService],
  exports: [ContextService, TokenService, EmailService],
})
export class ContextModule {}

/**
 * FRONTEND_URL: tek origin ya da virgülle ayrılmış liste.
 * Örn: "https://zeytin-psi.vercel.app,https://zeytin-saas.vercel.app"
 * Her parça http/https mutlak URL olmalıdır; boot'ta doğrulanır.
 */
const frontendUrlSchema = Joi.string()
  .default("http://localhost:3000")
  .custom((value, helpers) => {
    const origins = String(value)
      .split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);

    if (origins.length === 0) return helpers.error("any.invalid");

    const itemSchema = Joi.string().uri({ scheme: ["http", "https"] });
    for (const origin of origins) {
      if (itemSchema.validate(origin).error) return helpers.error("any.invalid");
    }

    return value;
  }, "virgülle ayrılmış origin listesi")
  .messages({
    "any.invalid":
      "FRONTEND_URL geçerli değil. Tek origin ya da virgülle ayrılmış http/https origin listesi olmalı.",
  });

@Module({
  imports: [
    ContextModule, // Global module import
    ConfigModule.forRoot({
      isGlobal: true,
      // Yerel geliştirmede .env.local (localhost DB) önceliklidir; .env prod
      // bağlantısını taşıyor. Sıra önemli: dizideki İLK dosyanın değeri kazanır,
      // böylece `npm run dev` yanlışlıkla prod'a bağlanmaz. Canlıda bu dosyalar
      // bulunmaz; ortam değişkenleri hosting panelinden gelir ve dosyaların
      // önüne geçer.
      envFilePath: [".env.local", ".env"],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        // Secret yoksa uygulama başlamaz. Bu doğrulama uzun süre yorumda kaldığı
        // için JWT_SECRET hiç tanımlanmamıştı ve kod içindeki sabit fallback
        // canlıda kullanılıyordu.
        JWT_SECRET: Joi.string().min(32).required().invalid("super-secret-key-change-in-prod"),
        // Virgülle ayrılmış origin listesi olabilir; her parça tek tek doğrulanır.
        // Düz `.uri()` çok parçalı değeri reddederdi.
        FRONTEND_URL: frontendUrlSchema,
        NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 60 saniye
        limit: 10, // Auth route'ları için
      },
      {
        name: 'long',
        ttl: 60000, // 60 saniye
        limit: 100, // Diğer route'lar için (default)
      },
    ]),
    AuditModule,
    TicketsModule,
    CustomersModule,
    ProductionModule,
    TransactionsModule,
    StockModule,
    ReportsModule,
    SmsModule,
    ProductsModule,
    AdminModule,
    AuthModule,
    SupportModule,
    TenantModule,
    PolicyModule,
    LeadsModule,
    EmailVerificationModule,
  ],
  providers: [
    PrismaService,
    IdGeneratorService,
    // Guard sırası kayıt sırasıdır: önce hız limiti, sonra kimlik, sonra rol.
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Varsayılan olarak HER route korumalıdır. Muafiyet için @Public() gerekir.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // @Roles() taşıyan route'ları uygular; taşımayanlara karışmaz.
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
