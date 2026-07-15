import { getRequestConfig } from "next-intl/server";
import { routing, isLocale, localeToBcp47 } from "./routing";

/**
 * Her istek için aktif dili ve mesaj kataloğunu çözer.
 * `next.config.mjs` içindeki `createNextIntlPlugin` bu dosyayı işaret eder.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // `requestLocale` [locale] segmentinden gelir; geçersiz/eksikse tr'ye düş.
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Intl biçimlendirmesi bölgesel etiketle daha doğru: "tr" yerine "tr-TR".
    // Bu, next-intl'in useFormatter()'ını lib/format.ts ile aynı hizaya sokar.
    timeZone: "Europe/Istanbul",
    formats: {
      dateTime: {
        short: { day: "2-digit", month: "2-digit", year: "numeric" },
        long: { day: "numeric", month: "long", year: "numeric" },
      },
    },
    // Eksik çeviri prod'da sayfayı düşürmemeli: anahtarı göster, logla.
    onError(error) {
      if (process.env.NODE_ENV === "development") console.error(error);
    },
    getMessageFallback({ namespace, key }) {
      return [namespace, key].filter(Boolean).join(".");
    },
  };
});

export { localeToBcp47 };
