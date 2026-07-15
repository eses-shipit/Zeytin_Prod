import type { Metadata } from "next";

/**
 * Kimlik doğrulamalı uygulama sayfası. Root layout'taki `noindex, nofollow`
 * varsayılanı miras alınır — burada sadece tarayıcı sekmesi başlığı verilir.
 */
export const metadata: Metadata = {
  title: "Lisanslar",
  description: "Lisans ve abonelik yönetimi.",
};

export default function AdminLicensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
