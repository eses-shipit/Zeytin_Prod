import { MiddlewareConsumer, Module, NestModule, RequestMethod, Global } from "@nestjs/common";
import { TenantMiddleware } from "./common/tenant.middleware";
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
import { ConfigModule } from "@nestjs/config";

import { AuditModule } from "./audit/audit.module";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import * as Joi from "joi";
import { ContextService } from "./common/context.service";

@Global() // ContextService'i global yapalım
@Module({
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {}

@Module({
  imports: [
    ContextModule, // Global module import
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        // JWT_SECRET: Joi.string().min(32).required(), // Uncomment when auth is fully active
        FRONTEND_URL: Joi.string().uri().default("http://localhost:3000"),
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
  ],
  providers: [
    PrismaService, 
    IdGeneratorService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
