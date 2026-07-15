import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, siteUrl } from "@/lib/seo";

/**
 * Kimlik doğrulamalı bir CRM olduğumuz için robots politikası "default-deny":
 * her şeyi yasakla, sadece gerçekten herkese açık sayfalara izin ver.
 *
 * `Disallow: /` + `Allow: /auth/login` birlikte çalışır: Google ve diğer büyük
 * tarayıcılar en uzun (en spesifik) kural eşleşmesini uygular, dolayısıyla
 * Allow satırları kök Disallow'u yener.
 *
 * DİKKAT: robots.txt indekslemeyi engeller ama erişimi engellemez. Asıl koruma
 * `src/middleware.ts` içindeki auth guard'dır; bu dosya sadece savunma katmanı.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [...PUBLIC_PATHS],
        disallow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
