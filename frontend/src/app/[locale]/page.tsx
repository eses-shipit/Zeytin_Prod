import type { Metadata } from "next";
import { WeighingTerminal } from "@/components/WeighingTerminal";

/**
 * `/` şu an kantar terminali — pazarlama/landing sayfası DEĞİL, kimlik
 * doğrulaması gerektiren bir uygulama ekranı (bkz. src/middleware.ts).
 * Root layout'tan gelen `noindex, nofollow` varsayılanı geçerli; burada
 * sadece tarayıcı sekmesi için başlık veriyoruz.
 */
export const metadata: Metadata = {
  title: "Kantar Terminali",
  description: "Kantar tartım ve fiş oluşturma terminali.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <WeighingTerminal />
    </main>
  );
}

