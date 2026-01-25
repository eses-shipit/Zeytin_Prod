import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { SupportService } from "./support.service";
import { CreateSupportTicketDto } from "./dto/create-support-ticket.dto";
import { CreateTicketMessageDto } from "./dto/create-ticket-message.dto";
import { UpdateTicketStatusDto } from "./dto/update-ticket-status.dto";
import { SupportTicketStatus, TicketPriority } from "@prisma/client";

@Controller("support")
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // Tenant Endpoints
  @Post()
  create(@Req() req: Request, @Body() dto: CreateSupportTicketDto) {
    return this.supportService.create(req.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    // Normal users/admins are restricted to their tenant
    return this.supportService.findAll({ tenantId: req.tenantId, role: 'USER' });
  }

  @Get(":id")
  findOne(@Req() req: Request, @Param("id") id: string) {
    return this.supportService.findOne(req.tenantId, id);
  }

  @Post(":id/messages")
  addMessage(@Req() req: Request, @Param("id") id: string, @Body() dto: CreateTicketMessageDto) {
    return this.supportService.addMessage(req.tenantId, id, dto, "CUSTOMER");
  }

  // Admin Endpoints (Should be protected by Role Guard in real app)
  @Get("admin/all")
  findAllAdmin(
      @Query('status') status?: SupportTicketStatus,
      @Query('priority') priority?: TicketPriority
  ) {
    // Super Admin can see all tickets
    return this.supportService.findAll({ role: 'SUPER_ADMIN' }, { status, priority });
  }
  
  @Get("admin/stats")
  getStats() {
      return this.supportService.getDashboardStats();
  }

  @Put("admin/:id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.supportService.updateStatus(id, dto.status);
  }

  @Post("admin/:id/messages")
  addAdminMessage(@Param("id") id: string, @Body() dto: CreateTicketMessageDto) {
    // Admin sends message, tenantId is not strictly needed for message creation logic if not validating ownership strictness against request
    // But for safety we might want to check existence. 
    // Passing a dummy tenantId or fetching ticket first in service handles logic.
    return this.supportService.addMessage("admin-override", id, dto, "ADMIN");
  }
}

