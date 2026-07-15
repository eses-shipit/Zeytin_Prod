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
