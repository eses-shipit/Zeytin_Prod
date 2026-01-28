import { IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator";

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @Length(11, 11, { message: "TCKN 11 haneli olmalıdır." })
  @Matches(/^\d+$/, { message: "TCKN sadece rakamlardan oluşmalıdır." })
  tckn?: string;

  @IsString()
  @IsOptional()
  village?: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {}

