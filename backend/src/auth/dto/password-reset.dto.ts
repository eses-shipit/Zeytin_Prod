import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;

  /** Sıfırlama e-postasının dili (tr/es/it/pt). Varsayılan tr. */
  @IsOptional()
  @IsIn(["tr", "es", "it", "pt"])
  locale?: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8, { message: "Yeni şifre en az 8 karakter olmalıdır." })
  newPassword!: string;
}
