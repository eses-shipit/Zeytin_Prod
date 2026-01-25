import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  tckn?: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {}

