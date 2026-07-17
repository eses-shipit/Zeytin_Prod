import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Lead, LeadStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../common/email.service";
import { EmailVerificationService } from "../verification/email-verification.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";

/** İnsanın formu doldurması için gereken en az süre (ms). Altındaki gönderim bot sayılır. */
const MIN_FILL_MS = 2500;

/**
 * Landing page iletişim/lisans taleplerini yönetir.
 *
 * Yeni talep geldiğinde LEAD_NOTIFY_EMAIL adresine (Brevo transactional)
 * bildirim e-postası gönderilir. Bot/spam koruması: honeypot alanı + gönderim
 * süresi kontrolü + endpoint'te sıkı hız limiti (controller).
 */
@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  async create(dto: CreateLeadDto): Promise<{ success: true }> {
    // --- Bot/spam kontrolleri: yakalananları SESSİZCE yut (başarı döndür) ki
    //     bot hangi kuralı tetiklediğini öğrenip uyarlanamasın. ---
    const isSpam =
      (dto.website && dto.website.trim().length > 0) || // honeypot dolu
      (typeof dto.renderedAt === "number" && Date.now() - dto.renderedAt < MIN_FILL_MS);

    if (isSpam) {
      this.logger.warn(`Lisans talebi spam olarak yutuldu (honeypot/timing).`);
      return { success: true };
    }

    // E-posta OTP doğrulaması ZORUNLU (honeypot+timing'in üstüne "duble" koruma):
    // bot e-postaya gelen kodu alamaz. 400 fırlatır; frontend OTP adımını gösterir.
    await this.emailVerification.assertVerified(dto.email);

    // Honeypot/timing alanlarını kayda yazma (Lead tablosunda yok).
    const { website: _hp, renderedAt: _rt, ...data } = dto;
    const lead = await this.prisma.lead.create({ data });

    // PII loglanmaz. Sadece takip için minimum bilgi.
    this.logger.log(`Yeni lisans talebi: id=${lead.id} ilgi=${lead.interest ?? "-"} dil=${lead.locale}`);

    void this.notify(lead); // ateşle-unut: bildirim asıl yanıtı geciktirmesin
    return { success: true };
  }

  /** Yeni talep bildirimi (Brevo). Adres tanımlı ve servis yapılandırılmışsa gönderilir. */
  private async notify(lead: Lead): Promise<void> {
    const to = process.env.LEAD_NOTIFY_EMAIL;
    if (!to) return;

    const e = EmailService.escapeHtml;
    const rows: Array<[string, string | null | undefined]> = [
      ["Ad", lead.name],
      ["E-posta", lead.email],
      ["Telefon", lead.phone],
      ["Fabrika", lead.factoryName],
      ["Şehir", lead.city],
      ["İlgi", lead.interest],
      ["Dil", lead.locale],
      ["Mesaj", lead.message],
    ];
    const html = `
      <h2>Yeni lisans/demo talebi</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows
          .filter(([, v]) => v)
          .map(([k, v]) => `<tr><td style="color:#64748b">${e(k)}</td><td><b>${e(String(v))}</b></td></tr>`)
          .join("")}
      </table>
      <p style="color:#94a3b8;font-size:12px">ZeytinSaaS iletişim formu · yanıtlamak için doğrudan yanıtlayın.</p>`;

    const ok = await this.email.send({
      to,
      subject: `Yeni talep: ${lead.name}${lead.interest ? ` (${lead.interest})` : ""}`,
      html,
      replyTo: lead.email, // "yanıtla" doğrudan talep sahibine gitsin
    });
    if (!ok) this.logger.warn(`Lisans talebi bildirimi gönderilemedi (id=${lead.id}).`);
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
