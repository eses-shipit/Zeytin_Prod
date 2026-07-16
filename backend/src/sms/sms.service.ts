import { Injectable, Logger } from "@nestjs/common";
import { MockSmsProvider } from "./providers/mock-sms.provider";

type SmsJob = {
  to: string;
  message: string;
  retries: number;
};

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  // Basit bir in-memory queue simülasyonu
  // Gerçek prodüksiyonda burası Redis/BullMQ olmalı.
  private queue: SmsJob[] = [];
  private isProcessing = false;

  constructor(private readonly smsProvider: MockSmsProvider) {}

  /**
   * SMS gönderim işi.
   *
   * @param simulated true (ücretsiz/demo): gerçek sağlayıcı ÇAĞRILMAZ. Mesaj
   *   yalnızca loglanır ve işlem başarılı sayılır; böylece operatörün ekranında
   *   "gönderildi" görünür ama müşteriye gerçek SMS gitmez. false (Pro): gerçek
   *   sağlayıcı devreye girer.
   *
   * NOT: Gerçek sağlayıcı (Netgsm/Twilio vb.) henüz entegre edilmedi;
   *   `smsProvider` şu an mock. Pro için tek yapılacak: MockSmsProvider yerine
   *   gerçek sağlayıcıyı bağlamak (sms.module.ts provider binding'i).
   */
  async queueSms(to: string, message: string, opts: { simulated?: boolean } = {}) {
    if (opts.simulated) {
      // Kuyruğa hiç girmez; sağlayıcıya dokunulmaz.
      this.logger.log(`[SİMÜLE] SMS gönderilmedi (ücretsiz plan). Alıcı: ${this.maskPhone(to)}`);
      return;
    }
    this.queue.push({ to, message, retries: 0 });
    this.logger.log(`Job added to queue. Queue size: ${this.queue.length}`);
    this.processQueue(); // Tetikle
  }

  /** Loglarda telefonu maskele (KVKK). */
  private maskPhone(phone: string): string {
    return phone.length > 4 ? `***${phone.slice(-4)}` : "***";
  }

  /**
   * Kuyruğu işleyen "Processor" simülasyonu
   */
  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;

      try {
        await this.smsProvider.sendSms(job.to, job.message);
      } catch (error) {
        this.logger.error(`Failed to send SMS to ${this.maskPhone(job.to)}`, error);
        // Basit retry mantığı (1 kez tekrar dene)
        if (job.retries < 1) {
          job.retries++;
          this.queue.push(job);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Üretim tamamlandığında gönderilecek mesajı formatlar ve kuyruğa ekler.
   */
  async sendProductionNotification(data: {
    customerName: string;
    customerPhone?: string;
    totalOliveKg: number;
    totalOilKg: number;
    yieldRatio: number;
    acidRatio?: number;
    factoryName?: string;
  }): Promise<boolean> {
    if (!data.customerPhone) {
      this.logger.warn(`No phone number for customer ${data.customerName}, skipping SMS.`);
      return false;
    }

    // Telefon numarası temizleme (Basitçe)
    const phone = data.customerPhone.replace(/\D/g, ""); // Sadece rakamlar
    if (!phone) return false;

    const factory = data.factoryName || "ZEYTINSAAS";
    
    const message = `Sn. ${data.customerName}, ürünleriniz işlemden çıkmış, yağ sıkılmıştır. Giren net: ${data.totalOliveKg}kg, Çıkan yağ: ${data.totalOilKg}kg, Randıman: 1/${data.yieldRatio.toFixed(2)}, Asit: ${data.acidRatio || "-"}. Fabrika: ${factory}`;

    await this.queueSms(phone, message);
    return true;
  }
}

