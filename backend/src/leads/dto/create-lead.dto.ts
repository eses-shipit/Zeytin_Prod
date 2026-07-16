import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

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
}
