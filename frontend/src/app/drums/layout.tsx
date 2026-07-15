import type { Metadata } from "next";

/**
 * Kimlik doğrulamalı uygulama sayfası. Root layout'taki `noindex, nofollow`
 * varsayılanı miras alınır — burada sadece tarayıcı sekmesi başlığı verilir.
 */
export const metadata: Metadata = {
  title: "Bidon Yönetimi",
  description: "Bidon envanteri ve teslimat takibi.",
};

export default function DrumsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
