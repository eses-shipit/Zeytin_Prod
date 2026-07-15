import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, siteUrl } from "@/lib/seo";

/**
 * Sitemap SADECE herkese açık sayfaları listeler.
 *
 * Uygulama içi rotalar (/customers, /production, /admin ...) buraya asla
 * eklenmemelidir: sitemap'e girmek, aksi halde keşfedilemeyecek URL'leri
 * arama motorlarına aktif olarak duyurmak demektir.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: path.startsWith("/legal") ? "yearly" : "monthly",
    priority: path.startsWith("/legal") ? 0.3 : 0.8,
  }));
}
