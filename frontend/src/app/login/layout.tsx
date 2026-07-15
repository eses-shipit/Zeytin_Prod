import type { Metadata } from "next";

/**
 * Kimlik doğrulamalı uygulama sayfası. Root layout'taki `noindex, nofollow`
 * varsayılanı miras alınır — burada sadece tarayıcı sekmesi başlığı verilir.
 */
export const metadata: Metadata = {
  title: "Yönlendiriliyor",
  description: "Giriş sayfasına yönlendiriliyorsunuz.",
};

export default function LoginRedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
