import { IsEmail, IsIn, IsString, Length, MaxLength } from "class-validator";

/** OTP amacı. Kayıt ve iletişim formu tek servis üzerinden ilerler. */
export const OTP_PURPOSES = ["REGISTER", "CONTACT"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export class RequestEmailOtpDto {
  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsIn(OTP_PURPOSES)
  purpose!: OtpPurpose;

  /** Kodun/e-postanın dili (tr/es/it/pt). Varsayılan tr. */
  @IsIn(["tr", "es", "it", "pt"])
  locale: string = "tr";
}

export class VerifyEmailOtpDto {
  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsIn(OTP_PURPOSES)
  purpose!: OtpPurpose;

  /** 6 haneli sayısal kod. */
  @IsString()
  @Length(6, 6)
  code!: string;
}

export class EmailOtpStatusDto {
  @IsEmail()
  @MaxLength(160)
  email!: string;
}
