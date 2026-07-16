import { routing } from "@/i18n/routing";

// Dil listesi tek kaynaktan gelsin: burada tekrar yazılırsa hreflang ile
// gerçek routing zamanla birbirinden ayrılır.
const SUPPORTED_LOCALES = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;

/**
 * Tek kaynak: hangi rotalar gerçekten herkese açık?
 *
 * Bu uygulama kimlik doğrulamalı bir CRM'dir. Uygulama sayfaları çiftçi
 * isimleri, TCKN ve cari bakiye gibi kişisel/finansal veri içerir; bunların
 * arama motorlarına sızmaması gerekir.
 *
 * Bu yüzden SEO politikası "varsayılan olarak yasakla" (default-deny):
 *  - Root layout tüm sayfaları `noindex, nofollow` yapar.
 *  - Sadece aşağıdaki PUBLIC_PATHS listesindeki sayfalar açıkça
 *    `index: true` ile bu varsayılanı geçersiz kılar.
 *  - robots.ts ve sitemap.ts da aynı listeyi kullanır.
 *
 * Yeni bir sayfayı buraya eklemeden ÖNCE: içinde kiracıya (tenant) ait
 * hiçbir veri render edilmediğinden emin ol.
 */
export const PUBLIC_PATHS = [
  "/", // Pazarlama/landing sayfası — indekslenmesi İSTENEN tek asıl sayfa.
  "/auth/login",
  "/auth/register",
  "/legal/privacy",
  "/legal/terms",
] as const;

/**
 * Kanonik site adresi. OpenGraph/canonical URL'lerin ve sitemap'in mutlak
 * adres üretebilmesi için `metadataBase` olarak kullanılır.
 *
 * NOT: Production dağıtımında NEXT_PUBLIC_SITE_URL mutlaka gerçek alan adına
 * ayarlanmalıdır; aksi halde OG/canonical adresleri localhost'a işaret eder.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Herkese açık sayfalarda root'taki noindex varsayılanını geçersiz kılar. */
export const INDEXABLE = {
  index: true,
  follow: true,
} as const;

/**
 * Belirli bir herkese açık sayfa için canonical + hreflang üretir.
 *
 * SADECE PUBLIC_PATHS içindeki sayfalarda kullan. Uygulama içi sayfalar
 * noindex olduğu için hreflang oradaki hiçbir soruna çare olmaz; dahası
 * `alternates.languages` vermek, indekslenmemesi gereken URL'leri arama
 * motorlarına duyurmak anlamına gelir.
 *
 * URL şeması `routing.localePrefix: "as-needed"` ile birebir uyumlu olmalı:
 *   tr (varsayılan) -> /auth/login        (prefix YOK)
 *   diğer diller    -> /es/auth/login
 * Aksi halde hreflang, redirect'e giden veya 404 olan adresleri gösterir.
 *
 * `x-default`: dil tercihi belirsiz olan botlara/kullanıcılara varsayılan
 * (prefix'siz, Türkçe) sürümü işaret eder.
 */
export function localizedAlternates(path: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const canonicalFor = (locale: string) =>
    locale === DEFAULT_LOCALE
      ? `${siteUrl}${path}`
      : `${siteUrl}/${locale}${path}`;

  const languages: Record<string, string> = {};
  for (const locale of SUPPORTED_LOCALES) {
    languages[locale] = canonicalFor(locale);
  }
  languages["x-default"] = canonicalFor(DEFAULT_LOCALE);

  return { canonical: canonicalFor(DEFAULT_LOCALE), languages };
}
