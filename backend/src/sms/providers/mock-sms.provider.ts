import { Injectable, Logger } from "@nestjs/common";
import { ISmsProvider } from "../interfaces/sms-provider.interface";

/** Telefon numarasını loglanabilir hale getirir: 05551110000 -> 0555***0000 */
function maskPhone(phone: string): string {
  if (phone.length <= 7) return "***";
  return `${phone.slice(0, 4)}***${phone.slice(-4)}`;
}

@Injectable()
export class MockSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(MockSmsProvider.name);

  async sendSms(to: string, message: string): Promise<boolean> {
    // Simülasyon gecikmesi
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mesaj gövdesi yalnızca geliştirmede yazılır: içinde müşteri adı ve üretim
    // rakamları var. Numara her koşulda maskelenir.
    if (process.env.NODE_ENV !== "production") {
      this.logger.debug(`[SMS MOCK] Alıcı: ${maskPhone(to)} | Mesaj: ${message}`);
    }
    this.logger.log(`SMS gönderildi: ${maskPhone(to)}`);

    return true;
  }
}

