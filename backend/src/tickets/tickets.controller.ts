import { Controller, Post, Body, Get, Query } from "@nestjs/common";
import { TicketsService } from "./tickets.service";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { TicketStatus } from "@prisma/client";
import { ContextService } from "../common/context.service";

@Controller("tickets")
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly contextService: ContextService,
  ) {}

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto) {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.ticketsService.create(tenantId, createTicketDto);
  }

  @Get("recent")
  async getRecent() {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.ticketsService.findRecent(tenantId);
  }

  @Get()
  async findAll(
    @Query("search") search?: string,
    @Query("status") status?: TicketStatus,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const tenantId = this.contextService.get("TENANT_ID") || "";
    return this.ticketsService.findAll(tenantId, { search, status, startDate, endDate });
  }
}
