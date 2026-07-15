import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

/**
 * Kimlik doğrulamalı uygulama sayfası. Root layout'taki `noindex, nofollow`
 * varsayılanı miras alınır — burada sadece tarayıcı sekmesi başlığı verilir.
 * `alternates.languages` (hreflang) BİLİNÇLİ olarak yok: sayfa noindex,
 * hreflang sadece herkese açık sayfalarda anlamlı (bkz. src/lib/seo.ts).
 *
 * Statik `metadata` yerine `generateMetadata`: başlığın da dile göre
 * değişmesi gerekiyor ve dil ancak istek anında biliniyor.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "dashboard.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
