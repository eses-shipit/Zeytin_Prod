import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export enum OliveQuality {
  TREE = "TREE",
  GROUND = "GROUND",
  MIXED = "MIXED",
}

/** Tek bir araç için üst sınır. Kantara sığmayan değer veri giriş hatasıdır. */
const MAX_TICKET_KG = 100_000;

export class CreateTicketDto {
  @IsString()
  customerId!: string;

  @IsInt()
  @Min(0)
  @Max(MAX_TICKET_KG)
  grossKg!: number;

  @IsInt()
  @Min(0)
  @Max(MAX_TICKET_KG)
  tareKg!: number;

  // netKg istemciden ALINMAZ; sunucuda grossKg - tareKg olarak hesaplanır.
  // Eskiden üçü de bağımsız olarak istemciden geliyor ve `...dto` ile doğrudan
  // yazılıyordu: netKg bütün pay hesaplarının tek girdisi olduğu için, dara ile
  // uyumsuz bir netKg göndermek müşteriye ödenecek yağı doğrudan belirliyordu.
  // ValidationPipe `forbidNonWhitelisted` ile gövdede gönderilirse istek reddedilir.

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_TICKET_KG)
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
