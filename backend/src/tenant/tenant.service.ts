import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ContextService } from "../common/context.service";

@Injectable()
export class TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contextService: ContextService,
  ) {}

  async getSettings() {
    const tenantId = this.contextService.get("TENANT_ID");
    if (!tenantId) {
      throw new NotFoundException("Tenant bulunamadı.");
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          where: { role: "ADMIN" },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
          take: 1,
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant bulunamadı.");
    }

    // Kalan lisans süresini hesapla
    let daysRemaining: number | null = null;
    if (tenant.subscriptionEndDate) {
      const now = new Date();
      const endDate = new Date(tenant.subscriptionEndDate);
      const diff = endDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    return {
      id: tenant.id,
      name: tenant.name,
      officialName: tenant.officialName,
      taxId: tenant.taxId,
      address: tenant.address,
      city: tenant.city,
      code: tenant.code,
      status: tenant.status,
      subscriptionEndDate: tenant.subscriptionEndDate,
      defaultDrumWeight: tenant.defaultDrumWeight,
      daysRemaining,
      authorizedPerson: tenant.users[0] || null,
    };
  }

  async updateSettings(dto: {
    name?: string;
    officialName?: string;
    taxId?: string;
    address?: string;
    city?: string;
    defaultDrumWeight?: number;
  }) {
    const tenantId = this.contextService.get("TENANT_ID");
    if (!tenantId) {
      throw new NotFoundException("Tenant bulunamadı.");
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant bulunamadı.");
    }

    return await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.officialName !== undefined && { officialName: dto.officialName }),
        ...(dto.taxId !== undefined && { taxId: dto.taxId }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.defaultDrumWeight !== undefined && { defaultDrumWeight: dto.defaultDrumWeight }),
      },
    });
  }
}
