import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { INDEXABLE, localizedAlternates } from "@/lib/seo";
import { localeToOpenGraph, isLocale, routing } from "@/i18n/routing";
import { getLegalContent, getLegalUi } from "@/content/legal";
import { LegalDocument } from "@/components/legal/LegalDocument";

/**
 * Gizlilik Politikası ve Aydınlatma Metni — herkese açık, indekslenebilir sayfa
 * (PUBLIC_PATHS). Sunucu bileşeni olduğu için metadata'yı doğrudan burada
 * üretir; hukuki metin dile göre `@/content/legal` modülünden gelir.
 *
 * UYARI: İçerik KVKK/GDPR uyumlu bir TASLAK'tır; yayınlanmadan önce bir hukukçu
 * tarafından incelenmelidir. Sayfa en üstte belirgin bir TASLAK uyarısı gösterir.
 */

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const activeLocale = isLocale(locale) ? locale : routing.defaultLocale;
  const alternates = localizedAlternates("/legal/privacy");
  const ui = getLegalUi(activeLocale);

  return {
    title: ui.privacyTitle,
    description: ui.privacyDescription,
    alternates,
    robots: INDEXABLE,
    openGraph: {
      type: "article",
      locale: localeToOpenGraph[activeLocale],
      siteName: "ZeytinSaaS",
      url: alternates.languages[activeLocale],
      title: `${ui.privacyTitle} | ZeytinSaaS`,
      description: ui.privacyDescription,
    },
  };
}

export default function PrivacyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const activeLocale = isLocale(locale) ? locale : routing.defaultLocale;
  setRequestLocale(activeLocale);

  const content = getLegalContent(activeLocale);
  const ui = getLegalUi(activeLocale);

  return (
    <LegalDocument
      title={ui.privacyTitle}
      lastUpdated={content.lastUpdated}
      lastUpdatedLabel={ui.lastUpdatedLabel}
      draftDisclaimer={content.draftDisclaimer}
      sections={content.privacy}
      backHref="/auth/login"
      backLabel={ui.backToLogin}
    />
  );
}
