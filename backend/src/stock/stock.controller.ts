import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
} from "@nestjs/common";
import { CreateStockTankDto } from "./dto/create-stock-tank.dto";
import { StockService } from "./stock.service";
import { ContextService } from "../common/context.service";

@Controller("stock")
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly contextService: ContextService,
  ) {}

  @Get("tanks")
  async findAll() {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.stockService.findAll(tenantId);
  }

  @Post("tanks")
  async create(@Body() body: CreateStockTankDto) {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.stockService.create(tenantId, body);
  }

  @Patch("tanks/:id")
  async update(@Param("id") id: string, @Body() body: Partial<CreateStockTankDto>) {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.stockService.update(tenantId, id, body);
  }

  @Delete("tanks/:id")
  async delete(@Param("id") id: string) {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.stockService.delete(tenantId, id);
  }
}

