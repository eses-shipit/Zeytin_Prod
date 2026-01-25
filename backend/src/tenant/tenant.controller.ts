import { Controller, Get, Patch, Body } from "@nestjs/common";
import { TenantService } from "./tenant.service";

@Controller("tenant")
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get("settings")
  async getSettings() {
    return this.tenantService.getSettings();
  }

  @Patch("settings")
  async updateSettings(@Body() dto: {
    name?: string;
    officialName?: string;
    taxId?: string;
    address?: string;
    city?: string;
    defaultDrumWeight?: number;
  }) {
    return this.tenantService.updateSettings(dto);
  }
}
