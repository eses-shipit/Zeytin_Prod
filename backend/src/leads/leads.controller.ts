import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { LeadStatus, UserRole } from "@prisma/client";
import { LeadsService } from "./leads.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("leads")
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Landing page formu. Herkese açık.
   *
   * Sıkı hız limiti: form spam'ine karşı IP başına dakikada 5. (Global auth
   * route limiti 10/dk; bu ondan da düşük çünkü kimlik doğrulaması yok.)
   */
  @Public()
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  // --- Süper admin ---

  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  findAll(@Query("status") status?: LeadStatus) {
    return this.leadsService.findAll(status);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }
}
