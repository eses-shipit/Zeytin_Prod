import type { Metadata } from "next";
import { INDEXABLE, siteUrl } from "@/lib/seo";

/**
 * page.tsx client component olduğu için metadata burada tanımlanır.
 * Bu sayfa PUBLIC_PATHS içinde: root'taki noindex varsayılanı geçersiz kılınır.
 */
export const metadata: Metadata = {
  title: "Fabrika Kaydı Oluştur",
  description:
    "Zeytinyağı fabrikanızı ZeytinSaaS'e kaydedin. Kantar fişleri, üretim takibi ve müşteri cari hesapları tek platformda.",
  alternates: { canonical: `${siteUrl}/auth/register` },
  robots: INDEXABLE,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "ZeytinSaaS",
    url: `${siteUrl}/auth/register`,
    title: "Fabrika Kaydı Oluştur | ZeytinSaaS",
    description:
      "Zeytinyağı fabrikanızı ZeytinSaaS'e kaydedin ve tüm süreçlerinizi dijitalleştirin.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
