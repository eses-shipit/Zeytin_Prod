import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../common/email.service";
import { OtpPurpose } from "./dto/email-otp.dto";

/** Kod ömrü. Kısa tutulur; süre dolunca yeniden istenir. */
const OTP_TTL_MS = 10 * 60 * 1000; // 10 dakika
/** Aynı e-posta+amaç için iki gönderim arası en az bekleme (mail bombardımanına karşı). */
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 saniye
/** Bir kod için en fazla yanlış deneme; aşılınca kod geçersiz olur (kaba kuvvete karşı). */
const MAX_ATTEMPTS = 5;
/**
 * Doğrulanmış bir e-postanın "güvenilir" sayıldığı pencere. Bu sürede aynı
 * e-posta başka bir amaç için (ör. iletişimde doğrulayıp sonra kayıt) TEKRAR
 * OTP istemez. Kullanıcının isteği: "contact onaylandıysa kayıtta tekrar sorma".
 */
const TRUST_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

/**
 * E-posta OTP doğrulama servisi (kayıt + iletişim formu ortak kullanır).
 *
 * Güvenlik:
 *  - Kod DB'ye bcrypt özetiyle yazılır (ham kod yalnızca e-postada).
 *  - Kısa ömür + deneme sınırı + gönderim cooldown'ı.
 *  - Kullanıcı numaralandırmaya karşı: request her zaman `{ success: true }`
 *    döner; hesabın/e-postanın varlığı sızmaz.
 *
 * Operasyonel emniyet: `EMAIL_OTP_ENABLED=false` ile tamamen devre dışı
 * bırakılabilir (ör. e-posta sağlayıcı geçici arızalıysa kimse kilitlenmesin).
 * Varsayılan AÇIK.
 */
@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  private get enabled(): boolean {
    return process.env.EMAIL_OTP_ENABLED !== "false";
  }

  /** Kodu üretir, özetini saklar ve e-posta ile gönderir. Yanıt daima başarılıdır. */
  async requestOtp(email: string, purpose: OtpPurpose, locale = "tr"): Promise<{ success: true }> {
    email = email.trim().toLowerCase();
    if (!this.enabled) return { success: true };

    // Cooldown: yakın zamanda gönderilmiş, hâlâ geçerli bir kod varsa yeniden
    // gönderme (spam/mail bombardımanı önlemi). Kullanıcıya yine başarı döner.
    const recent = await this.prisma.emailOtp.findFirst({
      where: { email, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      this.logger.debug(`OTP cooldown aktif (${purpose}).`);
      return { success: true };
    }

    // Önceki kullanılmamış kodları geçersiz kıl — aynı anda tek geçerli kod olsun.
    await this.prisma.emailOtp.deleteMany({ where: { email, purpose, consumedAt: null } });

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const codeHash = await bcrypt.hash(code, 10);
    await this.prisma.emailOtp.create({
      data: { email, purpose, codeHash, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
    });

    // Geliştirmede e-posta sağlayıcı yapılandırılmamış olabilir; akış test
    // edilebilsin diye kodu YALNIZCA production DIŞINDA logla. Prod'da asla.
    if (process.env.NODE_ENV !== "production") {
      this.logger.warn(`[OTP DEV] ${email} (${purpose}) kodu: ${code}`);
    }

    const { subject, html } = buildOtpEmail(code, locale);
    const ok = await this.email.send({ to: email, subject, html });
    if (!ok && process.env.NODE_ENV === "production") {
      // Prod'da gönderilemezse kullanıcı ilerleyemez; net bir hata ver.
      throw new BadRequestException("Doğrulama kodu gönderilemedi. Lütfen daha sonra tekrar deneyin.");
    }

    return { success: true };
  }

  /** Kodu doğrular. Başarılıysa e-posta bu amaç için "doğrulanmış" işaretlenir. */
  async verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<{ verified: true }> {
    email = email.trim().toLowerCase();
    if (!this.enabled) return { verified: true };

    const record = await this.prisma.emailOtp.findFirst({
      where: { email, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    // Aynı, üye-dostu hata: kod yanlış/expired/hiç istenmemiş — ayrım verme.
    const invalid = () => new BadRequestException("Kod geçersiz veya süresi dolmuş. Yeni kod isteyin.");
    if (!record) throw invalid();

    if (record.attempts >= MAX_ATTEMPTS) {
      await this.prisma.emailOtp.delete({ where: { id: record.id } });
      throw invalid();
    }

    const ok = await bcrypt.compare(code, record.codeHash);
    if (!ok) {
      await this.prisma.emailOtp.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException("Kod hatalı.");
    }

    await this.prisma.emailOtp.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
    return { verified: true };
  }

  /** E-posta güven penceresi içinde (herhangi bir amaçla) doğrulanmış mı? */
  async isVerified(email: string): Promise<boolean> {
    if (!this.enabled) return true;
    email = email.trim().toLowerCase();
    const count = await this.prisma.emailOtp.count({
      where: { email, consumedAt: { gt: new Date(Date.now() - TRUST_WINDOW_MS) } },
    });
    return count > 0;
  }

  /** Doğrulanmamışsa 400 fırlatır. Kayıt/iletişim akışının kapısı. */
  async assertVerified(email: string): Promise<void> {
    if (!(await this.isVerified(email))) {
      throw new BadRequestException("E-posta adresi doğrulanmadı. Lütfen önce e-postanıza gelen kodu girin.");
    }
  }
}

/** OTP e-postasının konu + gövdesini (dile göre) üretir. */
function buildOtpEmail(code: string, locale: string): { subject: string; html: string } {
  const L: Record<string, { subject: string; intro: string; expires: string; ignore: string }> = {
    tr: {
      subject: "ZeytinSaaS doğrulama kodunuz",
      intro: "E-posta adresinizi doğrulamak için kodunuz:",
      expires: "Kod 10 dakika geçerlidir.",
      ignore: "Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.",
    },
    es: {
      subject: "Tu código de verificación de ZeytinSaaS",
      intro: "Tu código para verificar tu correo electrónico:",
      expires: "El código es válido durante 10 minutos.",
      ignore: "Si no solicitaste esto, puedes ignorar este correo.",
    },
    it: {
      subject: "Il tuo codice di verifica ZeytinSaaS",
      intro: "Il tuo codice per verificare l'indirizzo email:",
      expires: "Il codice è valido per 10 minuti.",
      ignore: "Se non hai richiesto questo, ignora pure questa email.",
    },
    pt: {
      subject: "O seu código de verificação ZeytinSaaS",
      intro: "O seu código para verificar o seu email:",
      expires: "O código é válido durante 10 minutos.",
      ignore: "Se não solicitou isto, pode ignorar este email.",
    },
  };
  const t = L[locale] ?? L.tr;
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#0f5132;margin:0 0 16px">ZeytinSaaS</h2>
      <p style="color:#334155;margin:0 0 12px">${t.intro}</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0f172a;background:#f1f5f9;border-radius:12px;padding:16px;text-align:center;margin:0 0 12px">${code}</div>
      <p style="color:#64748b;font-size:13px;margin:0 0 4px">${t.expires}</p>
      <p style="color:#94a3b8;font-size:12px;margin:16px 0 0">${t.ignore}</p>
    </div>`;
  return { subject: t.subject, html };
}
