import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CreateLicenseDto } from "./dto/create-license.dto";
import { UpdateTenantDto } from "./dto/update-tenant.dto";
import { AuthService } from "../auth/auth.service";
import { SuperAdminGuard } from "../common/guards/super-admin.guard";

@Controller("admin")
@UseGuards(SuperAdminGuard) // Tüm admin endpoint'leri Super Admin guard ile korunuyor
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService
  ) {}

  @Get("stats")
  getGlobalStats() {
    return this.adminService.getGlobalStats();
  }

  @Post("impersonate/:tenantId")
  async impersonateTenant(@Param("tenantId") tenantId: string, @Req() req: any) {
      // In a real scenario, check req.user.role === 'SUPER_ADMIN'
      // For MVP, we allow this endpoint to be called.
      // Ideally we should pass the admin ID, but for now we skip that validation or pass a placeholder.
      return this.authService.impersonate("super-admin-id", tenantId);
  }

  @Get("tenants")
  getAllTenants() {
    return this.adminService.getAllTenants();
  }

  @Post("tenants/:id/extend")
  extendTenant(@Param("id") id: string, @Body() body: { days: number }) {
    return this.adminService.extendTenant(id, body.days);
  }

  @Patch("tenants/:id")
  updateTenant(@Param("id") id: string, @Body() dto: UpdateTenantDto) {
    return this.adminService.updateTenant(id, dto);
  }

  @Delete("tenants/:id")
  deleteTenant(@Param("id") id: string) {
    return this.adminService.deleteTenant(id);
  }

  @Post("licenses")
  createLicense(@Body() dto: CreateLicenseDto) {
    return this.adminService.createLicense(dto);
  }

  @Get("licenses")
  getLicenses() {
    return this.adminService.getLicenses();
  }

  @Delete("licenses/:id")
  deleteLicense(@Param("id") id: string) {
    return this.adminService.deleteLicense(id);
  }

  // User Management Endpoints
  @Get("tenants/:tenantId/users")
  getTenantUsers(@Param("tenantId") tenantId: string) {
    return this.adminService.getTenantUsers(tenantId);
  }

  @Post("tenants/:tenantId/users")
  createTenantUser(@Param("tenantId") tenantId: string, @Body() body: { name: string; email: string; password: string; phone?: string; role: string }) {
    return this.adminService.createTenantUser(tenantId, body);
  }

  @Patch("users/:userId")
  updateTenantUser(@Param("userId") userId: string, @Body() body: { name?: string; email?: string; phone?: string; role?: string }) {
    return this.adminService.updateTenantUser(userId, body);
  }

  @Delete("users/:userId")
  deleteTenantUser(@Param("userId") userId: string) {
    return this.adminService.deleteTenantUser(userId);
  }
}
