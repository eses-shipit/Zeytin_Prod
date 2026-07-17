import { Injectable, Logger } from "@nestjs/common";

/**
 * Brevo (transactional) e-posta servisi.
 *
 * Bağımlılık eklemez — Brevo REST API'sine doğrudan fetch ile gider
 * (POST https://api.brevo.com/v3/smtp/email). KAMPANYA API'si değil; OTP ve
 * bildirim gibi tekil (transactional) e-postalar içindir.
 *
 * Env:
 *   BREVO_API_KEY      — Brevo API anahtarı (gizli, yalnızca .env).
 *   BREVO_SENDER_EMAIL — Brevo'da DOĞRULANMIŞ gönderen adresi (zorunlu).
 *   BREVO_SENDER_NAME  — gönderen görünen adı (varsayılan "ZeytinSaaS").
 *
 * Yapılandırılmamışsa gönderim yapılmaz, yalnızca loglanır — davranış bozulmaz.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey = process.env.BREVO_API_KEY;
  private readonly senderEmail = process.env.BREVO_SENDER_EMAIL;
  private readonly senderName = process.env.BREVO_SENDER_NAME || "ZeytinSaaS";

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.senderEmail);
  }

  /**
   * Tekil e-posta gönderir. Başarılıysa true döner.
   * Gönderim hataları yutulmaz (loglanır) ama çağıranın akışını kesmemesi için
   * exception fırlatmaz — çağıran isterse false'a göre karar verir.
   */
  async send(opts: {
    to: string;
    toName?: string;
    subject: string;
    html: string;
    replyTo?: string;
  }): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.warn(
        `E-posta gönderilmedi (BREVO_API_KEY/BREVO_SENDER_EMAIL tanımsız). Konu: "${opts.subject}"`,
      );
      return false;
    }

    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": this.apiKey!,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: this.senderName, email: this.senderEmail },
          to: [{ email: opts.to, ...(opts.toName ? { name: opts.toName } : {}) }],
          subject: opts.subject,
          htmlContent: opts.html,
          ...(opts.replyTo ? { replyTo: { email: opts.replyTo } } : {}),
        }),
      });

      if (!res.ok) {
        // Yanıt gövdesi hata ayrıntısı taşır (ör. gönderen doğrulanmamış).
        const detail = await res.text().catch(() => "");
        this.logger.error(`Brevo gönderimi başarısız (${res.status}): ${detail.slice(0, 300)}`);
        return false;
      }
      return true;
    } catch (err: any) {
      this.logger.error(`Brevo isteği hatası: ${err?.message ?? err}`);
      return false;
    }
  }

  /** Basit HTML kaçışı (kullanıcı girdisini e-postaya gömerken). */
  static escapeHtml(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
