import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { INDEXABLE, localizedAlternates } from "@/lib/seo";
import { localeToOpenGraph, isLocale, routing } from "@/i18n/routing";

/**
 * page.tsx client component olduğu için metadata burada tanımlanır.
 * Bu sayfa PUBLIC_PATHS içinde: root'taki noindex varsayılanı geçersiz kılınır.
 * Herkese açık olduğu için hreflang burada anlamlı.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const activeLocale = isLocale(locale) ? locale : routing.defaultLocale;
  const alternates = localizedAlternates("/auth/register");
  const t = await getTranslations({ locale, namespace: "auth.register.meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates,
    robots: INDEXABLE,
    openGraph: {
      type: "website",
      locale: localeToOpenGraph[activeLocale],
      siteName: "ZeytinSaaS",
      url: alternates.languages[activeLocale],
      title: t("ogTitle"),
      description: t("ogDescription"),
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
