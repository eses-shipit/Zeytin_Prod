import { IsNotEmpty, IsOptional, IsString, Length, Matches, ValidateIf } from "class-validator";

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  // TCKN opsiyonel. Form boş bırakılınca istemci `tckn: ""` gönderiyor;
  // `@IsOptional()` yalnızca null/undefined'ı atladığı için boş string'te
  // Length/Matches tetiklenip "TCKN 11 haneli" hatası (400) veriyordu.
  // ValidateIf ile yalnızca DOLU tckn doğrulanır.
  @ValidateIf((o) => o.tckn !== undefined && o.tckn !== null && o.tckn !== "")
  @IsString()
  @Length(11, 11, { message: "TCKN 11 haneli olmalıdır." })
  @Matches(/^\d+$/, { message: "TCKN sadece rakamlardan oluşmalıdır." })
  tckn?: string;

  @IsString()
  @IsOptional()
  village?: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {}

