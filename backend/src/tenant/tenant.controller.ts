import { Controller, Get, Patch, Body } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { TenantService } from "./tenant.service";
import { UpdateTenantSettingsDto } from "./dto/update-tenant-settings.dto";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("tenant")
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get("settings")
  async getSettings() {
    return this.tenantService.getSettings();
  }

  // Fabrika kimliğini ve varsayılanlarını yalnızca yöneticiler değiştirebilir;
  // route rolsüzdü ve herhangi bir USER resmi unvanı/vergi numarasını yazabiliyordu.
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch("settings")
  async updateSettings(@Body() dto: UpdateTenantSettingsDto) {
    return this.tenantService.updateSettings(dto);
  }
}
