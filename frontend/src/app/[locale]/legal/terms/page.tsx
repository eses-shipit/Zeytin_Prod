import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { INDEXABLE, localizedAlternates } from "@/lib/seo";
import { localeToOpenGraph, isLocale, routing } from "@/i18n/routing";
import { getLegalContent, getLegalUi } from "@/content/legal";
import { LegalDocument } from "@/components/legal/LegalDocument";

/**
 * Kullanım Koşulları — herkese açık, indekslenebilir sayfa (PUBLIC_PATHS).
 * Sunucu bileşeni olduğu için metadata'yı doğrudan burada üretir; hukuki
 * metin dile göre `@/content/legal` modülünden gelir.
 *
 * UYARI: İçerik taslaktır ve yayınlanmadan önce bir hukukçu tarafından
 * incelenmelidir; sayfa en üstte belirgin bir TASLAK uyarısı gösterir.
 */

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const activeLocale = isLocale(locale) ? locale : routing.defaultLocale;
  const alternates = localizedAlternates("/legal/terms");
  const ui = getLegalUi(activeLocale);

  return {
    title: ui.termsTitle,
    description: ui.termsDescription,
    alternates,
    robots: INDEXABLE,
    openGraph: {
      type: "article",
      locale: localeToOpenGraph[activeLocale],
      siteName: "ZeytinSaaS",
      url: alternates.languages[activeLocale],
      title: `${ui.termsTitle} | ZeytinSaaS`,
      description: ui.termsDescription,
    },
  };
}

export default function TermsPage({
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
      title={ui.termsTitle}
      lastUpdated={content.lastUpdated}
      lastUpdatedLabel={ui.lastUpdatedLabel}
      draftDisclaimer={content.draftDisclaimer}
      sections={content.terms}
      backHref="/auth/login"
      backLabel={ui.backToLogin}
    />
  );
}
