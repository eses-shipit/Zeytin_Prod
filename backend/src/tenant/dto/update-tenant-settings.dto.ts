import { IsNumber, IsOptional, IsPositive, IsString, Max, MaxLength } from "class-validator";

/**
 * Eskiden bu gövde controller'da satır içi tip olarak yazılıydı. ValidationPipe
 * metatype'ı olmayan parametreleri doğrulamadan geçirdiği için `whitelist` ve
 * `forbidNonWhitelisted` bu endpoint'te hiç çalışmıyordu; defaultDrumWeight
 * negatif veya sayı olmayan değer alabiliyordu.
 */
export class UpdateTenantSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  officialName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(2000, { message: "Bidon ağırlığı 2000 kg'ı aşamaz." })
  defaultDrumWeight?: number;
}
