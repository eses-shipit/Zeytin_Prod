import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";

@Module({
  controllers: [StockController],
  providers: [StockService, PrismaService],
})
export class StockModule {}

