import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

export enum ServiceType {
  PERCENTAGE = "PERCENTAGE",
  CASH_PER_KG = "CASH_PER_KG",
}

/** Decimal(12,3) kolon genişliğinden gelen üst sınır. */
const MAX_OIL_KG = 1_000_000;
/** Hizmet bedeli nakit ise TL/kg üst sınırı. */
const MAX_CASH_PER_KG = 10_000;
/** Hak yağ oranı üst sınırı (%). */
const MAX_PERCENTAGE = 99;

/**
 * serviceAmount'ın anlamı serviceType'a bağlı olduğu için üst sınırı da öyle.
 * Aynı alana iki @ValidateIf koymak işe yaramaz: class-validator koşulları
 * VE'ler, iki tip aynı anda sağlanamaz ve alan hiç doğrulanmazdı.
 */
@ValidatorConstraint({ name: "serviceAmountWithinRange", async: false })
export class ServiceAmountWithinRange implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments): boolean {
    const { serviceType } = args.object as CreateProductionBatchDto;
    if (typeof value !== "number") return false;

    return serviceType === ServiceType.PERCENTAGE
      ? value <= MAX_PERCENTAGE
      : value <= MAX_CASH_PER_KG;
  }

  defaultMessage(args: ValidationArguments): string {
    const { serviceType } = args.object as CreateProductionBatchDto;
    return serviceType === ServiceType.PERCENTAGE
      ? `Hak yağ oranı %${MAX_PERCENTAGE}'u aşamaz.`
      : `Sıkım bedeli ${MAX_CASH_PER_KG} TL/kg'ı aşamaz.`;
  }
}

export class CreateProductionBatchDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ticketIds!: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  drumIds?: string[];

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(MAX_OIL_KG)
  totalOilKg!: number;

  @IsEnum(ServiceType)
  serviceType!: ServiceType;

  // Üst sınır hizmet tipine göre değişir, o yüzden ayrı bir kısıt sınıfıyla
  // doğrulanıyor: yüzde modelinde 100, müşterinin payının TAMAMINI fabrikaya
  // verir; 100'ün üstü payı negatife düşürür. Tek koruma @Min(0) olduğu için
  // ikisi de mümkündü.
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Validate(ServiceAmountWithinRange)
  serviceAmount!: number; // % or Price per KG

  @IsString()
  @IsOptional()
  tankId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Max(100) // Asit oranı yüzdedir; Decimal(5,2) kolonuna da uymak zorunda.
  acidRatio?: number;

  @IsBoolean()
  @IsOptional()
  storeCustomerOil?: boolean;

  // Process Data
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(120) // Sıkım sıcaklığı (°C)
  processTemp?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(99)
  lineId?: number;

  @IsBoolean()
  @IsOptional()
  filtration?: boolean;
}
