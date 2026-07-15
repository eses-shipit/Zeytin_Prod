import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { DrumType } from "@prisma/client";

/** Decimal(8,3) kolon genişliğinden gelen üst sınır. */
const MAX_DRUM_KG = 10_000;

export class CreateDrumSizeDto {
  @IsString()
  @MaxLength(60)
  name!: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(MAX_DRUM_KG)
  capacityKg!: number;

  /** Boş bidonun ağırlığı; dolu tartımdan düşülür. */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(MAX_DRUM_KG)
  tareKg?: number;

  @IsEnum(DrumType)
  type!: DrumType;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateDrumSizeDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(MAX_DRUM_KG)
  capacityKg?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(MAX_DRUM_KG)
  tareKg?: number;

  @IsOptional()
  @IsEnum(DrumType)
  type?: DrumType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
