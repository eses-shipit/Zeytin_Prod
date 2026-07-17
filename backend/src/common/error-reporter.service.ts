import { Injectable, Logger } from "@nestjs/common";

/**
 * Sunucu hatalarını harici bir izleme servisine iletmek için dikiş.
 *
 * Bağımlılık eklemez. `ERROR_WEBHOOK_URL` env değişkeni tanımlıysa, 5xx
 * hatalarının PII İÇERMEYEN bir özeti o adrese POST edilir (Sentry-uyumlu
 * endpoint, Slack incoming webhook, ya da kendi toplayıcınız). Tanımsızsa
 * hiçbir şey yapmaz — davranış değişmez.
 *
 * Gerçek Sentry entegrasyonu istenirse: @sentry/node ekleyip burada
 * `Sentry.captureException` çağrısıyla değiştirmek yeterli. Filtre bu servisi
 * çağırdığı için tek nokta burasıdır.
 */
@Injectable()
export class ErrorReporterService {
  private readonly logger = new Logger(ErrorReporterService.name);
  private readonly webhookUrl = process.env.ERROR_WEBHOOK_URL;

  /**
   * @param summary PII İÇERMEZ: requestId, path, status, hata adı/mesajı.
   *   İstek gövdesi, kullanıcı verisi vb. ASLA geçilmemeli.
   */
  report(summary: {
    requestId: string;
    method: string;
    path: string;
    status: number;
    detail: string;
  }): void {
    if (!this.webhookUrl) return;

    // Ateşle-unut: bildirim gönderimi asıl yanıtı geciktirmemeli/bozmamalı.
    void fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "zeytin-backend",
        env: process.env.NODE_ENV ?? "development",
        timestamp: new Date().toISOString(),
        ...summary,
      }),
    }).catch((err) => {
      // Bildirim hatası sessizce yutulmaz ama isteği etkilemez.
      this.logger.warn(`Hata bildirimi gönderilemedi: ${err?.message ?? err}`);
    });
  }
}
