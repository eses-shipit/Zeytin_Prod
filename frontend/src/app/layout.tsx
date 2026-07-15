import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import { OfflineBanner } from "@/components/OfflineBanner";
import { OfflineSyncManager } from "@/components/OfflineSyncManager";
import ImpersonateBanner from "@/components/ImpersonateBanner";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    // Alt sayfalar sadece kendi başlıklarını verir: "Müşteriler" -> "Müşteriler | ZeytinSaaS"
    template: "%s | ZeytinSaaS",
    default: "ZeytinSaaS | Zeytinyağı Fabrikası Yönetim Platformu",
  },
  description: "Zeytinyağı fabrikaları için kantar, üretim ve müşteri yönetim platformu.",
  manifest: "/manifest.webmanifest", // Next.js generates this from manifest.ts
  applicationName: "ZeytinSaaS",
  /**
   * VARSAYILAN OLARAK İNDEKSLEME YOK.
   *
   * Burası kimlik doğrulamalı bir CRM; sayfalar çiftçi isimleri, TCKN ve cari
   * bakiye içeriyor. Backend'deki auth guard ile aynı prensip: default-deny.
   * Sadece `src/lib/seo.ts` -> PUBLIC_PATHS içindeki sayfalar kendi
   * layout'larında `robots: INDEXABLE` ile bunu geçersiz kılar.
   *
   * Yeni sayfa eklerken hiçbir şey yapmana gerek yok: otomatik noindex.
   */
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZeytinSaaS",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // App-like feel, prevents zooming
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // TODO(i18n): `lang` şimdilik sabit "tr". [locale] tabanlı routing fazında
    // bu değer segment parametresinden dinamik olarak gelecek.
    <html lang="tr">
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            nav, .no-print { display: none !important; }
            body { background: white; }
            main { margin: 0; padding: 0; }
          }
        `}} />
      </head>
      <body className="bg-slate-50 min-h-screen">
        <ImpersonateBanner />
        <OfflineBanner />
        <OfflineSyncManager />
        <Navbar />
        <main>{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
