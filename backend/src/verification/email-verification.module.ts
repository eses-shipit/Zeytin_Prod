import { Module } from "@nestjs/common";
import { EmailVerificationController } from "./email-verification.controller";
import { EmailVerificationService } from "./email-verification.service";
import { PrismaService } from "../prisma/prisma.service";

/**
 * E-posta OTP doğrulaması. EmailService global (ContextModule) olduğundan burada
 * sağlanmaz. Servis dışarı aktarılır: AuthModule (kayıt) ve LeadsModule
 * (iletişim) `assertVerified` için kullanır.
 */
@Module({
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService, PrismaService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
