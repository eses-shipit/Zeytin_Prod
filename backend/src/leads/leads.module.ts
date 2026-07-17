import { Module } from "@nestjs/common";
import { LeadsController } from "./leads.controller";
import { LeadsService } from "./leads.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmailVerificationModule } from "../verification/email-verification.module";

@Module({
  imports: [EmailVerificationModule],
  controllers: [LeadsController],
  providers: [LeadsService, PrismaService],
  exports: [LeadsService],
})
export class LeadsModule {}
