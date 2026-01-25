import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export enum TicketPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export class CreateSupportTicketDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @IsString()
  @IsNotEmpty()
  message: string;
}

