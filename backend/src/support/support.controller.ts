import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { UserRole, SupportTicketStatus, TicketPriority } from "@prisma/client";
import { SupportService } from "./support.service";
import { CreateSupportTicketDto } from "./dto/create-support-ticket.dto";
import { CreateTicketMessageDto } from "./dto/create-ticket-message.dto";
import { UpdateTicketStatusDto } from "./dto/update-ticket-status.dto";
import { ContextService } from "../common/context.service";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("support")
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
    private readonly contextService: ContextService,
  ) {}

  // --- Fabrika (tenant) endpoint'leri ---
  // tenantId artık doğrulanmış token'dan gelen bağlamdan okunur. Eskiden
  // `req.tenantId` kullanılıyordu; onu eski TenantMiddleware yazıyordu.

  @Post()
  create(@Body() dto: CreateSupportTicketDto) {
    return this.supportService.create(this.tenantId(), dto);
  }

  @Get()
  findAll() {
    return this.supportService.findAll({ tenantId: this.tenantId(), role: UserRole.USER });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.supportService.findOne(this.tenantId(), id);
  }

  @Post(":id/messages")
  addMessage(@Param("id") id: string, @Body() dto: CreateTicketMessageDto) {
    return this.supportService.addMessage(this.tenantId(), id, dto, "CUSTOMER");
  }

  // --- Platform yöneticisi endpoint'leri ---
  // Bu route'lar guard'sızdı ve servise sabit `role: 'SUPER_ADMIN'` geçiyordu:
  // kimliği doğrulanmamış herhangi biri bütün fabrikaların destek taleplerini
  // okuyabiliyor ve "ADMIN" adına mesaj yazabiliyordu.

  @Roles(UserRole.SUPER_ADMIN)
  @Get("admin/all")
  findAllAdmin(
    @Query("status") status?: SupportTicketStatus,
    @Query("priority") priority?: TicketPriority,
  ) {
    return this.supportService.findAll({ role: this.role() }, { status, priority });
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get("admin/stats")
  getStats() {
    return this.supportService.getDashboardStats();
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Put("admin/:id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.supportService.updateStatus(id, dto.status);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Post("admin/:id/messages")
  addAdminMessage(@Param("id") id: string, @Body() dto: CreateTicketMessageDto) {
    return this.supportService.addMessage(null, id, dto, "ADMIN");
  }

  /** Rol, sabit değil, doğrulanmış bağlamdan okunur. */
  private role(): UserRole {
    return this.contextService.get("USER_ROLE");
  }

  private tenantId(): string {
    return this.contextService.get("TENANT_ID");
  }
}
