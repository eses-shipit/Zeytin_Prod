import type { Metadata } from "next";

/**
 * Kimlik doğrulamalı uygulama sayfası. Root layout'taki `noindex, nofollow`
 * varsayılanı miras alınır — burada sadece tarayıcı sekmesi başlığı verilir.
 */
export const metadata: Metadata = {
  title: "Yönlendiriliyor",
  description: "Kayıt sayfasına yönlendiriliyorsunuz.",
};

export default function RegisterRedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
