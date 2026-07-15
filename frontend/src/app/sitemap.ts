import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, siteUrl, localizedAlternates } from "@/lib/seo";

/**
 * Sitemap SADECE herkese açık sayfaları listeler.
 *
 * Uygulama içi rotalar (/customers, /production, /admin ...) buraya asla
 * eklenmemelidir: sitemap'e girmek, aksi halde keşfedilemeyecek URL'leri
 * arama motorlarına aktif olarak duyurmak demektir.
 *
 * i18n notu: `alternates.languages` SADECE gerçekten çevrilmiş sayfalar için
 * verilir. /legal/* sayfaları KVKK'ya özgü Türkçe hukuki metindir ve
 * çevrilmeyecektir (bkz. I18N.md); onlar için dil alternatifi bildirmek
 * "bu sayfanın İspanyolcası var" yalanı olurdu. Bu yüzden legal, tek dilli
 * (prefix'siz, Türkçe) tek bir URL olarak kalıyor.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_PATHS.map((path) => {
    const isLegal = path.startsWith("/legal");

    return {
      url: `${siteUrl}${path}`,
      lastModified,
      changeFrequency: isLegal ? "yearly" : "monthly",
      priority: isLegal ? 0.3 : 0.8,
      ...(isLegal
        ? {}
        : { alternates: { languages: localizedAlternates(path).languages } }),
    };
  });
}
