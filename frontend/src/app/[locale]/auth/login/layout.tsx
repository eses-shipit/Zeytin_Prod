import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { INDEXABLE, localizedAlternates } from "@/lib/seo";
import { localeToOpenGraph, isLocale, routing } from "@/i18n/routing";

/**
 * page.tsx bir client component ("use client") olduğu için metadata export
 * edemez. Metadata bu segment layout'unda tanımlanır.
 *
 * Bu sayfa PUBLIC_PATHS içinde: root'taki noindex varsayılanını bilinçli olarak
 * geçersiz kılıyoruz. Herkese açık olduğu için hreflang de BURADA anlamlı.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const activeLocale = isLocale(locale) ? locale : routing.defaultLocale;
  const alternates = localizedAlternates("/auth/login");
  const t = await getTranslations({ locale, namespace: "auth.login.meta" });

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

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
