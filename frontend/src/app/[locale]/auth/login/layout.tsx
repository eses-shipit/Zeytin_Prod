import type { Metadata } from "next";
import { INDEXABLE, siteUrl } from "@/lib/seo";

/**
 * page.tsx bir client component ("use client") olduğu için metadata export
 * edemez. Metadata bu segment layout'unda tanımlanır.
 *
 * Bu sayfa PUBLIC_PATHS içinde: root'taki noindex varsayılanını bilinçli olarak
 * geçersiz kılıyoruz.
 */
export const metadata: Metadata = {
  title: "Giriş Yap",
  description:
    "ZeytinSaaS fabrika yönetim paneline giriş yapın. Kantar, üretim ve müşteri işlemlerinizi tek panelden yönetin.",
  alternates: { canonical: `${siteUrl}/auth/login` },
  robots: INDEXABLE,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "ZeytinSaaS",
    url: `${siteUrl}/auth/login`,
    title: "Giriş Yap | ZeytinSaaS",
    description:
      "ZeytinSaaS fabrika yönetim paneline giriş yapın.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
