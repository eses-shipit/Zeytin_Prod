import type { Metadata } from "next";
import { INDEXABLE, localizedAlternates } from "@/lib/seo";
import { localeToOpenGraph, isLocale, routing } from "@/i18n/routing";

/**
 * page.tsx bir client component ("use client") olduğu için metadata export
 * edemez. Metadata bu segment layout'unda tanımlanır.
 *
 * Bu sayfa PUBLIC_PATHS içinde: root'taki noindex varsayılanını bilinçli olarak
 * geçersiz kılıyoruz. Herkese açık olduğu için hreflang de BURADA anlamlı.
 *
 * NOT: Başlık/açıklama metinleri halen Türkçe — bu sayfanın stringleri henüz
 * kataloğa taşınmadı (bkz. I18N.md, öncelik listesi). hreflang şu an sadece
 * "bu URL'nin şu dillerdeki karşılığı budur" diyor; içerik migrasyonu
 * yapıldığında bu metinler de `getTranslations` ile buradan gelecek.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const activeLocale = isLocale(locale) ? locale : routing.defaultLocale;
  const alternates = localizedAlternates("/auth/login");

  return {
    title: "Giriş Yap",
    description:
      "ZeytinSaaS fabrika yönetim paneline giriş yapın. Kantar, üretim ve müşteri işlemlerinizi tek panelden yönetin.",
    alternates,
    robots: INDEXABLE,
    openGraph: {
      type: "website",
      locale: localeToOpenGraph[activeLocale],
      siteName: "ZeytinSaaS",
      url: alternates.languages[activeLocale],
      title: "Giriş Yap | ZeytinSaaS",
      description: "ZeytinSaaS fabrika yönetim paneline giriş yapın.",
    },
  };
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
