import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { DrumType } from "@prisma/client";

// Bu üç endpoint gövdeyi satır içi tip olarak alıyordu. ValidationPipe,
// metatype'ı olmayan parametreleri doğrulamadan geçirir: yani `whitelist` ve
// `forbidNonWhitelisted` bu route'larda (deliver-drums dahil) hiç çalışmıyordu.

const MAX_DRUM_KG = 10_000;

export class CreateDrumDto {
  @IsString()
  @MaxLength(40)
  code!: string;

  @IsEnum(DrumType)
  type!: DrumType;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(MAX_DRUM_KG)
  capacity!: number;

  /** Fabrika kataloğundaki tip. Verilirse kapasite oradan doğrulanır. */
  @IsOptional()
  @IsString()
  drumSizeId?: string;
}

export class DeliverDrumsDto {
  @IsString()
  productionId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  drumIds?: string[];
}

export class ReturnDrumsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  drumIds!: string[];
}
