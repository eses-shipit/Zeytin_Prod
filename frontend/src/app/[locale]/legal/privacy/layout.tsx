import type { Metadata } from "next";
import { INDEXABLE, siteUrl } from "@/lib/seo";

/**
 * page.tsx client component olduğu için metadata burada tanımlanır.
 * Bu sayfa PUBLIC_PATHS içinde: root'taki noindex varsayılanı geçersiz kılınır.
 */
export const metadata: Metadata = {
  title: "Gizlilik Politikası ve Aydınlatma Metni",
  description:
    "ZeytinSaaS olarak kişisel verilerinizi KVKK kapsamında nasıl işlediğimizi, sakladığımızı ve koruduğumuzu açıklayan aydınlatma metni.",
  alternates: { canonical: `${siteUrl}/legal/privacy` },
  robots: INDEXABLE,
  openGraph: {
    type: "article",
    locale: "tr_TR",
    siteName: "ZeytinSaaS",
    url: `${siteUrl}/legal/privacy`,
    title: "Gizlilik Politikası ve Aydınlatma Metni | ZeytinSaaS",
    description:
      "Kişisel verilerinizin KVKK kapsamında işlenmesine ilişkin aydınlatma metni.",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
