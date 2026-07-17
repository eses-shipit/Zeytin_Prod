import { IsEmail, IsIn, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateLeadDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  factoryName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @IsOptional()
  @IsIn(["STANDARD", "PRO", "DEMO"])
  interest?: string;

  @IsOptional()
  @IsIn(["tr", "es", "it", "pt"])
  locale?: string;

  // --- Bot/spam koruması ---

  /**
   * HONEYPOT. Formda gizli bir alan; gerçek kullanıcı görmez, boş bırakır.
   * Botlar otomatik doldurur. Doluysa istek spam sayılır (sessizce yutulur).
   * Not: forbidNonWhitelisted açık olduğu için bu alan DTO'da tanımlı OLMALI.
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  /**
   * Formun render edildiği zaman damgası (ms). İnsan doldurması birkaç saniye
   * sürer; bot anında gönderir. Çok hızlı gönderimler reddedilir.
   */
  @IsOptional()
  @IsInt()
  renderedAt?: number;
}
