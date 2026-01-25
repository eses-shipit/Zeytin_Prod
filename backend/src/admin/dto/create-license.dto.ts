import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateLicenseDto {
  @IsString()
  @IsOptional()
  code?: string; // Opsiyonel, verilmezse otomatik üret

  @IsInt()
  @Min(1)
  days!: number;
}

