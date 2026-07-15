import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import { OfflineBanner } from "@/components/OfflineBanner";
import { OfflineSyncManager } from "@/components/OfflineSyncManager";
import ImpersonateBanner from "@/components/ImpersonateBanner";
import { siteUrl } from "@/lib/seo";
import { routing, isLocale, localeToBcp47 } from "@/i18n/routing";

/**
 * Bu, uygulamanın ROOT layout'udur. `src/app/layout.tsx` artık YOK — çünkü
 * `<html lang>` değerinin [locale] segmentine bağlı olması gerekiyor ve o
 * segment ancak burada okunabiliyor. Next.js altındaki tüm sayfaları bu
 * layout ile sarmaladığı için ayrıca bir üst layout'a ihtiyaç yok.
 *
 * robots.ts / sitemap.ts / manifest.ts bilinçli olarak `src/app/` altında
 * kaldı: bunlar sayfa değil, dilden bağımsız metadata rotaları.
 */

/** Build sırasında 4 dilin de statik olarak üretilmesini sağlar. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Desteklenmeyen bir dil kodu ("/de/dashboard") 404 olmalı; sessizce tr'ye
  // düşmek yanlış dilde içerik servis etmek demek olurdu.
  if (!isLocale(locale)) {
    notFound();
  }

  // Statik render sırasında aktif dili bildirir (generateStaticParams ile birlikte).
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    // `lang` artık [locale] segmentinden geliyor. Bölgesel etiket kullanıyoruz
    // ("tr-TR") çünkü ekran okuyucular ve tarayıcı çevirisi için daha spesifik.
    <html lang={localeToBcp47[locale]}>
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
        {/*
          Mesajları client component'lere taşır. Şu an TÜM sayfalar
          "use client" olduğu için katalog bütün olarak gönderiliyor.
          Katalog büyüdüğünde `pick()` ile sayfa bazlı daraltılmalı (bkz. I18N.md).
        */}
        <NextIntlClientProvider messages={messages}>
          <ImpersonateBanner />
          <OfflineBanner />
          <OfflineSyncManager />
          <Navbar />
          <main>{children}</main>
          <Toaster position="top-right" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
