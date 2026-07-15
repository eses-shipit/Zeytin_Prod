import type { Metadata } from "next";

/**
 * Kimlik doğrulamalı uygulama sayfası. Root layout'taki `noindex, nofollow`
 * varsayılanı miras alınır — burada sadece tarayıcı sekmesi başlığı verilir.
 */
export const metadata: Metadata = {
  title: "Stok Yönetimi",
  description: "Stok seviyeleri ve hareketleri.",
};

export default function StockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
