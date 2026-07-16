import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Lead, LeadStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";

/**
 * Landing page iletişim/lisans taleplerini yönetir.
 *
 * E-posta bildirimi: harici bir e-posta servisi (SMTP/Resend) kurulu değil.
 * Şimdilik talep veritabanına yazılır, süper admin panelinden görülür ve
 * loglanır. LEAD_NOTIFY_EMAIL env değişkeni ileride bildirim adresi olarak
 * kullanılabilir; servis eklenince tek nokta burasıdır.
 */
@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto): Promise<{ success: true }> {
    const lead = await this.prisma.lead.create({ data: dto });

    // PII loglanmaz (e-posta/telefon). Sadece takip için minimum bilgi.
    this.logger.log(
      `Yeni lisans talebi: id=${lead.id} ilgi=${lead.interest ?? "-"} dil=${lead.locale}`,
    );

    const notify = process.env.LEAD_NOTIFY_EMAIL;
    if (notify) {
      // TODO: e-posta servisi eklenince buradan bildirim gönder.
      this.logger.debug(`Bildirim adresi tanımlı (${notify}) ama e-posta servisi yok; talep yalnızca kayıtlı.`);
    }

    // Ziyaretçiye lead id'si veya iç bilgi dönülmez.
    return { success: true };
  }

  findAll(status?: LeadStatus): Promise<Lead[]> {
    return this.prisma.lead.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, dto: UpdateLeadDto): Promise<Lead> {
    const exists = await this.prisma.lead.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Talep bulunamadı.");
    return this.prisma.lead.update({ where: { id }, data: dto });
  }

  countNew(): Promise<number> {
    return this.prisma.lead.count({ where: { status: LeadStatus.NEW } });
  }
}
