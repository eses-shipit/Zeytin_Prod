import { Type } from "class-transformer";
import { IsDate, IsNumber, IsOptional, Max, Min } from "class-validator";

export class SetDailyPriceDto {
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.01)
  @Max(1_000_000) // Decimal(12,4) kolon genişliği
  pricePerKg!: number;

  /** Verilmezse bugün. Geçmiş bir günün fiyatını düzeltmek için kullanılır. */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;
}
