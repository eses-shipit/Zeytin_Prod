import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";
import { IdGeneratorService } from "../common/id-generator.service";

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, PrismaService, IdGeneratorService],
})
export class TicketsModule {}
