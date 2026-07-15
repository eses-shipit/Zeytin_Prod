import type { Metadata } from "next";

/**
 * Kimlik doğrulamalı uygulama sayfası. Root layout'taki `noindex, nofollow`
 * varsayılanı miras alınır — burada sadece tarayıcı sekmesi başlığı verilir.
 */
export const metadata: Metadata = {
  title: "Müşteriler",
  description: "Müşteri kartları, cari hesaplar ve bakiye takibi.",
};

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
