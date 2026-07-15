import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

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
      // Denetim kaydı başarısız olsa da asıl işlem engellenmez.
      // Hata nesnesinin tamamı basılmıyor: `details` içinde müşteri telefonu ve
      // mesaj gövdesi olabiliyor ve Prisma hatası bu yükü metne taşıyabilir.
      this.logger.error(
        `Denetim kaydı yazılamadı (action=${action}, tenantId=${tenantId}): ${
          error instanceof Error ? error.message : "bilinmeyen hata"
        }`,
      );
    }
  }
}

