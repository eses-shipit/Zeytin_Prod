import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export enum ServiceType {
  PERCENTAGE = "PERCENTAGE",
  CASH_PER_KG = "CASH_PER_KG",
}

export class CreateProductionBatchDto {
  @IsArray()
  @IsString({ each: true })
  ticketIds!: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  drumIds?: string[];

  @IsNumber()
  @Min(0)
  totalOilKg!: number;

  @IsEnum(ServiceType)
  serviceType!: ServiceType;

  @IsNumber()
  @Min(0)
  serviceAmount!: number; // % or Price per KG

  @IsString()
  @IsOptional()
  tankId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  acidRatio?: number;

  @IsBoolean()
  @IsOptional()
  storeCustomerOil?: boolean;

  // Process Data
  @IsInt()
  @IsOptional()
  @Min(0)
  processTemp?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  lineId?: number;

  @IsBoolean()
  @IsOptional()
  filtration?: boolean;
}
