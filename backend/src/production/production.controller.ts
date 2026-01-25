import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { ProductionService } from "./production.service";
import { CreateProductionBatchDto } from "./dto/create-production-batch.dto";
import { ContextService } from "../common/context.service";

@Controller("production")
export class ProductionController {
  constructor(
    private readonly productionService: ProductionService,
    private readonly contextService: ContextService,
  ) {}

  @Post()
  async create(@Body() dto: CreateProductionBatchDto) {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.productionService.processBatch(tenantId, dto);
  }

  @Post("resend-sms/:batchId")
  async resendSms(@Param("batchId") batchId: string) {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.productionService.resendSms(tenantId, batchId);
  }

  @Get("pending-tickets")
  async getPendingTickets() {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.productionService.getPendingTickets(tenantId);
  }

  @Get("completed/:id")
  async getBatchDetails(@Param("id") id: string) {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.productionService.getBatchDetails(tenantId, id);
  }

  @Get("completed")
  async getCompletedBatches() {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.productionService.getCompletedBatches(tenantId);
  }

  @Get("drums")
  async listDrums(@Query("status") status?: "AVAILABLE" | "WITH_CUSTOMER") {
    return this.productionService.listDrums(status);
  }

  @Post("drums")
  async createDrum(@Body() body: { code: string; type: "PLASTIC" | "CHROME" | "TIN"; capacity: number }) {
    return this.productionService.createDrum(body);
  }

  @Post("deliver-drums")
  async deliverDrums(@Body() body: { productionId: string; drumIds?: string[] }) {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.productionService.deliverDrums(tenantId, body.productionId, body.drumIds);
  }

  @Post("return-drums")
  async returnDrums(@Body() body: { drumIds: string[] }) {
    return this.productionService.returnDrums(body.drumIds);
  }
}
