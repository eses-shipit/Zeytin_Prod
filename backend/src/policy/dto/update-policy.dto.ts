import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";
import { EscrowModel, FeeBasis, PriceSource, ServiceType } from "@prisma/client";

/**
 * Politika güncelleme. Her alan opsiyoneldir: gönderilmeyen alan bir önceki
 * sürümden aynen taşınır.
 *
 * Alanlar arası tutarlılık (ör. emanet kapalıyken varsayılan emanet) burada
 * değil PolicyService.assertCoherent içinde denetlenir; class-validator alanları
 * tek tek görür.
 */
export class UpdatePolicyDto {
  // --- Hizmet bedeli ---
  @IsOptional()
  @IsEnum(ServiceType)
  defaultServiceType?: ServiceType;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(10_000)
  defaultServiceAmount?: number;

  @IsOptional()
  @IsEnum(FeeBasis)
  percentageBasis?: FeeBasis;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  minServiceAmount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  maxServiceAmount?: number;

  @IsOptional()
  @IsBoolean()
  allowServiceOverride?: boolean;

  // --- Emanet ---
  @IsOptional()
  @IsBoolean()
  escrowEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  escrowDefault?: boolean;

  @IsOptional()
  @IsEnum(EscrowModel)
  escrowModel?: EscrowModel;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  escrowStorageFeePerKgPerMonth?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  escrowExpiryDays?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  minWithdrawalKg?: number;

  // --- Ödeme ---
  @IsOptional()
  @IsBoolean()
  allowNegativeBalance?: boolean;

  @IsOptional()
  @IsEnum(PriceSource)
  liquidationPriceSource?: PriceSource;

  // Pro özelliği: gerçek SMS. false ise üretim sonrası SMS simüle edilir.
  @IsOptional()
  @IsBoolean()
  messageAutomationEnabled?: boolean;

  // --- Birim ve yuvarlama ---
  // ISO 4217. Şimdilik desteklenen pazarlar: Türkiye ve AB (ES/IT/PT).
  @IsOptional()
  @IsIn(["TRY", "EUR"])
  currency?: string;

  // Kolon genişlikleri Decimal(12,3) ve Decimal(14,2): gösterim hassasiyeti
  // saklama hassasiyetini aşamaz.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  kgDecimalPlaces?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  tlDecimalPlaces?: number;

  @IsOptional()
  @IsBoolean()
  yieldAsRatio?: boolean;
}
