import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsBoolean, IsIn } from "class-validator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  licenseCode!: string;

  @IsString()
  @IsNotEmpty()
  factoryName!: string;

  @IsString()
  @IsNotEmpty()
  factoryShortCode!: string; // e.g. 'AYD'

  @IsString()
  @IsOptional()
  officialName?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsNotEmpty()
  userName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsBoolean()
  @IsNotEmpty()
  acceptedTerms!: boolean; // KVKK ve Kullanım Koşulları onayı

  // Kaydın yapıldığı dil. Fabrikanın başlangıç para birimini belirler
  // (ES/IT/PT -> EUR, TR -> TRY). Sonradan politika ekranından değiştirilebilir.
  @IsOptional()
  @IsIn(["tr", "es", "it", "pt"])
  locale?: string;
}

