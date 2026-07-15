import type { Metadata } from "next";
import { INDEXABLE, localizedAlternates } from "@/lib/seo";
import { localeToOpenGraph, isLocale, routing } from "@/i18n/routing";

/**
 * page.tsx client component olduğu için metadata burada tanımlanır.
 * Bu sayfa PUBLIC_PATHS içinde: root'taki noindex varsayılanı geçersiz kılınır.
 * Herkese açık olduğu için hreflang burada anlamlı.
 *
 * NOT: metinler halen Türkçe — string migrasyonu için bkz. I18N.md.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const activeLocale = isLocale(locale) ? locale : routing.defaultLocale;
  const alternates = localizedAlternates("/auth/register");

  return {
    title: "Fabrika Kaydı Oluştur",
    description:
      "Zeytinyağı fabrikanızı ZeytinSaaS'e kaydedin. Kantar fişleri, üretim takibi ve müşteri cari hesapları tek platformda.",
    alternates,
    robots: INDEXABLE,
    openGraph: {
      type: "website",
      locale: localeToOpenGraph[activeLocale],
      siteName: "ZeytinSaaS",
      url: alternates.languages[activeLocale],
      title: "Fabrika Kaydı Oluştur | ZeytinSaaS",
      description:
        "Zeytinyağı fabrikanızı ZeytinSaaS'e kaydedin ve tüm süreçlerinizi dijitalleştirin.",
    },
  };
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
