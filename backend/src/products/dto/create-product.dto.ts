import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  isActive: boolean;
}

export class UpdateProductDto extends CreateProductDto {}

