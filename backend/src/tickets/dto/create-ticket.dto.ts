import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export enum OliveQuality {
  TREE = "TREE",
  GROUND = "GROUND",
  MIXED = "MIXED",
}

export class CreateTicketDto {
  @IsString()
  customerId!: string;

  @IsInt()
  @Min(0)
  grossKg!: number;

  @IsInt()
  @Min(0)
  tareKg!: number;

  @IsInt()
  @Min(0)
  netKg!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  scaleWeightKg?: number;

  // Master Data
  @IsString()
  @IsOptional()
  origin?: string;

  // Deprecated but optional
  @IsString()
  @IsOptional()
  variety?: string;

  // New Relation
  @IsString()
  @IsOptional()
  productId?: string;

  @IsEnum(OliveQuality)
  @IsOptional()
  quality?: OliveQuality;

  @IsString()
  @IsOptional()
  containerNos?: string;

  @IsString()
  @IsOptional()
  note?: string; // New Field
}
