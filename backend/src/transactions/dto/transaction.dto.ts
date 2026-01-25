import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateDeliveryDto {
  @IsNumber()
  @Min(0.1)
  amountKg!: number;

  @IsString()
  @IsOptional()
  tankId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateLiquidationDto {
  @IsNumber()
  @Min(0.1)
  amountKg!: number;

  @IsNumber()
  @Min(0.01)
  unitPrice!: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreatePaymentDto {
  @IsNumber()
  @Min(1)
  amountTL!: number;

  @IsString()
  @IsOptional()
  description?: string;
}
