import { Module, Global } from "@nestjs/common";
import { SmsService } from "./sms.service";
import { MockSmsProvider } from "./providers/mock-sms.provider";

@Global() // Global yaparak her modülde import etmek zorunda kalmayalım
@Module({
  providers: [SmsService, MockSmsProvider],
  exports: [SmsService],
})
export class SmsModule {}

