import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { EmailVerificationService } from "./email-verification.service";
import {
  EmailOtpStatusDto,
  RequestEmailOtpDto,
  VerifyEmailOtpDto,
} from "./dto/email-otp.dto";
import { Public } from "../common/decorators/public.decorator";

/**
 * E-posta OTP uçları — hepsi herkese açık (hesap öncesi akış).
 *
 * Sıkı hız limiti: kod isteme uçları mail bombardımanına açık olduğundan
 * IP başına dakikada 5 ile sınırlanır.
 */
@Controller("verification/email")
export class EmailVerificationController {
  constructor(private readonly service: EmailVerificationService) {}

  @Public()
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @Post("request")
  request(@Body() dto: RequestEmailOtpDto) {
    return this.service.requestOtp(dto.email, dto.purpose, dto.locale);
  }

  @Public()
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  @Post("verify")
  verify(@Body() dto: VerifyEmailOtpDto) {
    return this.service.verifyOtp(dto.email, dto.purpose, dto.code);
  }

  /** Frontend "zaten doğrulanmış mı?" kontrolü — doğrulanmışsa OTP adımını atlar. */
  @Public()
  @Throttle({ short: { limit: 20, ttl: 60000 } })
  @Post("status")
  async status(@Body() dto: EmailOtpStatusDto) {
    return { verified: await this.service.isVerified(dto.email) };
  }
}
