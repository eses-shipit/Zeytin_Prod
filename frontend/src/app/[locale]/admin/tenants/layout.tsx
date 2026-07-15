import type { Metadata } from "next";

/**
 * Kimlik doğrulamalı uygulama sayfası. Root layout'taki `noindex, nofollow`
 * varsayılanı miras alınır — burada sadece tarayıcı sekmesi başlığı verilir.
 */
export const metadata: Metadata = {
  title: "Fabrikalar",
  description: "Kayıtlı fabrikaların (tenant) yönetimi.",
};

export default function AdminTenantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
