import type { Metadata } from "next";

/**
 * Kimlik doğrulamalı uygulama sayfası. Root layout'taki `noindex, nofollow`
 * varsayılanı miras alınır — burada sadece tarayıcı sekmesi başlığı verilir.
 */
export const metadata: Metadata = {
  title: "Envanter Yönetimi",
  description: "Depo ve envanter hareketleri.",
};

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
