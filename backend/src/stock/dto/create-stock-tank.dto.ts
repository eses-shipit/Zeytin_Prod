import { IsEnum, IsNotEmpty, IsNumber, IsString, Min, IsOptional } from "class-validator";

export enum OilType {
  ACID_03 = "ACID_03",
  ACID_05 = "ACID_05",
  ACID_08 = "ACID_08",
  VIRGIN = "VIRGIN",
  LAMPANTE = "LAMPANTE",
}

export class CreateStockTankDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(1)
  capacity!: number;

  @IsEnum(OilType)
  type!: OilType;

  @IsNumber()
  @IsOptional()
  currentLevel?: number;

  @IsNumber()
  @IsOptional()
  acidRatio?: number;
}

