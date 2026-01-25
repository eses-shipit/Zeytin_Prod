import { Injectable, Logger } from "@nestjs/common";
import { ISmsProvider } from "../interfaces/sms-provider.interface";

@Injectable()
export class MockSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(MockSmsProvider.name);

  async sendSms(to: string, message: string): Promise<boolean> {
    // Simülasyon gecikmesi
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Renkli log çıktısı
    // ANSI renk kodları: \x1b[36m (Cyan), \x1b[32m (Green), \x1b[0m (Reset)
    const logOutput = `\x1b[36m[SMS MOCK]\x1b[0m \x1b[33mTo:\x1b[0m ${to} | \x1b[33mSender:\x1b[0m ZEYTINSAAS | \x1b[32mMsg:\x1b[0m ${message}`;
    
    console.log(logOutput);
    this.logger.log(`SMS Sent successfully to ${to}`);
    
    return true;
  }
}

