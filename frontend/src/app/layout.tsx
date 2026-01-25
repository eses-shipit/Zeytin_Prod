import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import { OfflineBanner } from "@/components/OfflineBanner";
import { OfflineSyncManager } from "@/components/OfflineSyncManager";
import ImpersonateBanner from "@/components/ImpersonateBanner";

export const metadata: Metadata = {
  title: "Zeytin Fabrika Yönetim",
  description: "Zeytinyağı Fabrikası Yönetim Platformu",
  manifest: "/manifest.webmanifest", // Next.js generates this from manifest.ts
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
