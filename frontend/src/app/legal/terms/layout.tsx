import type { Metadata } from "next";
import { INDEXABLE, siteUrl } from "@/lib/seo";

/**
 * page.tsx client component olduğu için metadata burada tanımlanır.
 * Bu sayfa PUBLIC_PATHS içinde: root'taki noindex varsayılanı geçersiz kılınır.
 */
export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description:
    "ZeytinSaaS fabrika yönetim platformunun kullanım koşulları, abonelik şartları ve tarafların hak ve yükümlülükleri.",
  alternates: { canonical: `${siteUrl}/legal/terms` },
  robots: INDEXABLE,
  openGraph: {
    type: "article",
    locale: "tr_TR",
    siteName: "ZeytinSaaS",
    url: `${siteUrl}/legal/terms`,
    title: "Kullanım Koşulları | ZeytinSaaS",
    description:
      "ZeytinSaaS platformunun kullanım koşulları ve abonelik şartları.",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
