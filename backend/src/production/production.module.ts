import { Module } from "@nestjs/common";
import { ProductionController } from "./production.controller";
import { ProductionService } from "./production.service";
import { PrismaService } from "../prisma/prisma.service";
import { SmsModule } from "../sms/sms.module";
import { AuditModule } from "../audit/audit.module";
import { IdGeneratorService } from "../common/id-generator.service";

@Module({
  imports: [SmsModule, AuditModule],
  controllers: [ProductionController],
  providers: [ProductionService, PrismaService, IdGeneratorService],
})
export class ProductionModule {}
