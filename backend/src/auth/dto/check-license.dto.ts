import { IsNotEmpty, IsString } from "class-validator";

export class CheckLicenseDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
