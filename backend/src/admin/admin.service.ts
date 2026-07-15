import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLicenseDto } from "./dto/create-license.dto";
import { LicenseStatus, TenantStatus, UserRole } from "@prisma/client";
import * as crypto from "crypto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalStats() {
    // 1. Management Stats
    const totalTenants = await this.prisma.tenant.count();
    const activeTenants = await this.prisma.tenant.count({
      where: { status: "ACTIVE" },
    });
    const totalLicenses = await this.prisma.license.count();
    const usedLicenses = await this.prisma.license.count({
      where: { status: "USED" },
    });

    // 2. Global Operational Stats (Aggregation across tenants)
    const tenants = await this.prisma.tenant.findMany({ select: { id: true, name: true } });

    let globalOliveKg = 0;
    let globalOilKg = 0;

    for (const t of tenants) {
      try {
        // forTenant yerine manuel where: { tenantId: t.id } kullanıyoruz
        // NOT: PrismaService middleware'i context boşsa (Super Admin global view) müdahale etmez.
        const olive = await this.prisma.productionBatch.aggregate({
          where: { tenantId: t.id },
          _sum: { totalOliveKg: true },
        });
        const oil = await this.prisma.productionBatch.aggregate({
          where: { tenantId: t.id },
          _sum: { totalOilKg: true },
        });

        globalOliveKg += olive._sum.totalOliveKg || 0;
        globalOilKg += oil._sum.totalOilKg || 0;
      } catch (e) {
        // console.error(`Error aggregating for tenant ${t.id}`, e);
      }
    }

    // 3. Recent Activities (Audit Log)
    const auditLogs = await this.prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        createdAt: true,
        tenantId: true,
      },
    });

    const recentActivities = auditLogs.map((log) => {
      const tenant = tenants.find((t) => t.id === log.tenantId);
      return {
        id: log.id,
        action: log.action,
        date: log.createdAt,
        tenantName: tenant ? tenant.name : "Global / Bilinmeyen",
      };
    });

    // 4. Expiring Tenants (Next 30 Days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringTenants = await this.prisma.tenant.findMany({
      where: {
        status: "ACTIVE",
        subscriptionEndDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(), // Not expired yet
        },
      },
      take: 5,
      orderBy: { subscriptionEndDate: "asc" },
      select: {
        id: true,
        name: true,
        subscriptionEndDate: true,
      },
    });

    // 5. Monthly Growth (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const newTenants = await this.prisma.tenant.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const monthlyGrowthMap = new Map<string, number>();
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString("tr-TR", { month: "long" });
      monthlyGrowthMap.set(key, 0);
    }

    newTenants.forEach((t) => {
      const key = new Date(t.createdAt).toLocaleString("tr-TR", { month: "long" });
      if (monthlyGrowthMap.has(key)) {
        monthlyGrowthMap.set(key, (monthlyGrowthMap.get(key) || 0) + 1);
      }
    });

    const monthlyGrowth = Array.from(monthlyGrowthMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    // 6. Support Ticket Stats
    const ticketStatsRaw = await this.prisma.supportTicket.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const ticketStats = ticketStatsRaw.map((t) => ({
      name: t.status,
      value: t._count.status,
    }));

    // 7. SMS Statistics (from AuditLog)
    const smsLogs = await this.prisma.auditLog.findMany({
      where: {
        action: "SMS_SENT",
      },
      select: {
        tenantId: true,
        createdAt: true,
      },
    });

    // SMS count per tenant
    const smsStatsByTenant = new Map<string, number>();
    smsLogs.forEach((log) => {
      const count = smsStatsByTenant.get(log.tenantId) || 0;
      smsStatsByTenant.set(log.tenantId, count + 1);
    });

    const smsStats = Array.from(smsStatsByTenant.entries()).map(([tenantId, count]) => {
      const tenant = tenants.find((t) => t.id === tenantId);
      return {
        tenantId,
        tenantName: tenant ? tenant.name : "Bilinmeyen",
        smsCount: count,
      };
    }).sort((a, b) => b.smsCount - a.smsCount); // Sort by count descending

    const totalSmsSent = smsLogs.length;

    return {
      totalTenants,
      activeTenants,
      totalLicenses,
      usedLicenses,
      globalOliveKg,
      globalOilKg,
      recentActivities,
      expiringTenants,
      monthlyGrowth,
      ticketStats,
      smsStats,
      totalSmsSent,
    };
  }

  async getAllTenants() {
    return await this.prisma.tenant.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createLicense(dto: CreateLicenseDto) {
    // Daha güvenli ve uzun kod: ZEYTIN-PRO-2026-UUID
    // crypto.randomUUID() bazen eski node versiyonlarında sorun olabilir, basit bir yöntem kullanalım.
    const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = dto.code || `ZEYTIN-PRO-${new Date().getFullYear()}-${uniqueSuffix}`;
    
    return await this.prisma.license.create({
      data: {
        code,
        planDurationDays: dto.days,
        status: "UNUSED"
      }
    });
  }

  async getLicenses() {
    return await this.prisma.license.findMany({
      include: {
        tenant: {
            select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async deleteLicense(id: string) {
    const license = await this.prisma.license.findUnique({ where: { id } });
    if (!license) throw new NotFoundException("Lisans bulunamadı.");
    
    if (license.status === LicenseStatus.USED) {
        throw new BadRequestException("Kullanılmış lisans silinemez. Önce fabrikayı askıya alın.");
    }

    return await this.prisma.license.delete({ where: { id } });
  }

  async extendTenant(tenantId: string, days: number) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException("Fabrika bulunamadı.");

    const currentEnd = tenant.subscriptionEndDate && tenant.subscriptionEndDate > new Date()
      ? tenant.subscriptionEndDate
      : new Date();

    const newEnd = new Date(currentEnd);
    newEnd.setDate(newEnd.getDate() + days);

    return await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { subscriptionEndDate: newEnd }
    });
  }

  async updateTenant(tenantId: string, data: { name?: string; code?: string; officialName?: string; taxId?: string; address?: string; city?: string }) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException("Fabrika bulunamadı.");

    return await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.officialName && { officialName: data.officialName }),
        ...(data.taxId && { taxId: data.taxId }),
        ...(data.address && { address: data.address }),
        ...(data.city && { city: data.city }),
      }
    });
  }

  async deleteTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ 
      where: { id: tenantId },
      include: {
        _count: {
          select: { users: true, licenses: true }
        }
      }
    });
    
    if (!tenant) throw new NotFoundException("Fabrika bulunamadı.");

    // İlişkili verileri kontrol et (opsiyonel: cascade delete yerine uyarı)
    if (tenant._count.users > 0) {
      throw new BadRequestException("Bu fabrikaya ait kullanıcılar var. Önce kullanıcıları silin.");
    }

    // License'ı da temizle (eğer varsa)
    await this.prisma.license.updateMany({
      where: { tenantId },
      data: { tenantId: null, status: "UNUSED" }
    });

    return await this.prisma.tenant.delete({ where: { id: tenantId } });
  }

  // User Management Methods
  async getTenantUsers(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException("Fabrika bulunamadı.");

    return await this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createTenantUser(tenantId: string, data: { name: string; email: string; password: string; phone?: string; role: string }) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException("Fabrika bulunamadı.");

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new BadRequestException("Bu e-posta adresi zaten kayıtlı.");
    }

    // Validate role (SUPER_ADMIN tenant user olamaz; cast ile tip uyumu)
    const validRoles: string[] = [UserRole.ADMIN, UserRole.USER];
    if (!validRoles.includes(data.role)) {
      throw new BadRequestException("Geçersiz kullanıcı rolü.");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    return await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        phone: data.phone,
        role: data.role as any,
        tenantId: tenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updateTenantUser(userId: string, data: { name?: string; email?: string; phone?: string; role?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Kullanıcı bulunamadı.");

    // If email is being changed, check for duplicates
    if (data.email && data.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        throw new BadRequestException("Bu e-posta adresi zaten kayıtlı.");
      }
    }

    // Validate role if provided (SUPER_ADMIN tenant user olamaz; cast ile tip uyumu)
    if (data.role) {
      const validRoles: string[] = [UserRole.ADMIN, UserRole.USER];
      if (!validRoles.includes(data.role)) {
        throw new BadRequestException("Geçersiz kullanıcı rolü.");
      }
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.role && { role: data.role as any }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async deleteTenantUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Kullanıcı bulunamadı.");

    // Prevent deleting the last admin user
    if (user.role === UserRole.ADMIN && user.tenantId) {
      const adminCount = await this.prisma.user.count({
        where: {
          tenantId: user.tenantId,
          role: UserRole.ADMIN,
        },
      });
      if (adminCount <= 1) {
        throw new BadRequestException("Son admin kullanıcı silinemez.");
      }
    }

    return await this.prisma.user.delete({ where: { id: userId } });
  }
}
