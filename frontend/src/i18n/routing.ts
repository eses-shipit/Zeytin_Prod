import { defineRouting } from "next-intl/routing";

/**
 * Tek kaynak: desteklenen diller ve URL prefix stratejisi.
 *
 * `localePrefix: "as-needed"` bilinçli bir seçim:
 *  - Varsayılan dil (tr) prefix ALMAZ  -> /dashboard  = Türkçe
 *  - Diğer diller prefix ALIR          -> /es/dashboard = İspanyolca
 *
 * Neden "always" değil? Uygulamada halen `router.push("/customers")` gibi
 * prefix'siz, elle yazılmış ~34 dosya var (bkz. I18N.md). "as-needed" ile
 * bu linkler Türkçe kullanıcı için OLDUĞU GİBİ çalışmaya devam eder ve
 * mevcut URL'ler (dolayısıyla canonical/sitemap adresleri) kırılmaz.
 *
 * Migrasyon tamamlandığında (tüm dosyalar `@/i18n/navigation` kullandığında)
 * burayı "always" yapmak tek satırlık bir değişiklik olacak.
 */
export const routing = defineRouting({
  locales: ["tr", "es", "it", "pt"],
  defaultLocale: "tr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

/** `unknown` bir string'in desteklenen bir dil olup olmadığını daraltır. */
export function isLocale(value: string | undefined): value is Locale {
  return !!value && (routing.locales as readonly string[]).includes(value);
}

/**
 * BCP-47 etiketleri. `Intl` API'si ve `<html lang>` için kullanılır.
 * "tr" tek başına geçerli olsa da, bölgesel biçim (ondalık ayracı, tarih
 * sırası, para birimi sembolü konumu) için tam etiket daha doğru sonuç verir.
 */
export const localeToBcp47: Record<Locale, string> = {
  tr: "tr-TR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
};

/** OpenGraph `locale` alanı için (og:locale underscore ister). */
export const localeToOpenGraph: Record<Locale, string> = {
  tr: "tr_TR",
  es: "es_ES",
  it: "it_IT",
  pt: "pt_PT",
};
