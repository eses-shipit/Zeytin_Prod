import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(
    tenantId: string,
    userId: string | null,
    action: string,
    resourceId?: string,
    details?: any,
    ipAddress?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action,
          resourceId,
          details: details ? JSON.stringify(details) : undefined,
          ipAddress,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // We don't want audit logging failure to block the main action, so we catch and log
    }
  }
}

