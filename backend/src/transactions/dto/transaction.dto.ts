import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

// Üst sınırlar Decimal kolon genişliklerinden gelir: amountKg -> Decimal(12,3),
// amountTL -> Decimal(14,2), unitPrice -> Decimal(12,4). Sınırsız değerler
// veritabanı seviyesinde ham 500 hatasına dönüşüyordu.
const MAX_KG = 1_000_000;
const MAX_TL = 100_000_000;
const MAX_UNIT_PRICE = 1_000_000;

export class CreateDeliveryDto {
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.1)
  @Max(MAX_KG)
  amountKg!: number;

  @IsString()
  @IsOptional()
  tankId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  description?: string;
}

export class CreateLiquidationDto {
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.1)
  @Max(MAX_KG)
  amountKg!: number;

  // Birim fiyat şimdilik istek başına serbest: fabrika bazlı günlük yağ fiyatı
  // tablosu Faz 3'te (tenant politikası) gelecek. O zamana kadar en azından
  // sınırlandırılmış durumda.
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.01)
  @Max(MAX_UNIT_PRICE)
  unitPrice!: number;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  description?: string;
}

export class CreatePaymentDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(MAX_TL)
  amountTL!: number;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  description?: string;
}
