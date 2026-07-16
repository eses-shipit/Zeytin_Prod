import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import type { LegalContent } from "./types";

import * as tr from "./tr";
import * as es from "./es";
import * as it from "./it";
import * as pt from "./pt";

export type { Section, LegalContent } from "./types";

/**
 * Dil kodundan hukuki içerik modülüne kayıt. Her modül `terms`, `privacy`,
 * `lastUpdated` ve `draftDisclaimer` dışa aktarır; bu da onları `LegalContent`
 * biçimine getirir.
 */
const REGISTRY: Record<Locale, LegalContent> = { tr, es, it, pt };

/** İstenen dil için hukuki içeriği döndürür; bilinmeyen dilde varsayılana düşer. */
export function getLegalContent(locale: string): LegalContent {
  return REGISTRY[locale as Locale] ?? REGISTRY[routing.defaultLocale];
}

/**
 * Sayfa başlıkları, açıklamaları ve "geri" bağlantısı için dile özgü kısa UI
 * metinleri. Uzun-form hukuki metinden ayrı tutulur; SEO metadata'sı ve sayfa
 * başlıkları buradan beslenir.
 */
type LegalUiStrings = {
  termsTitle: string;
  termsDescription: string;
  privacyTitle: string;
  privacyDescription: string;
  lastUpdatedLabel: string;
  backToLogin: string;
};

const UI: Record<Locale, LegalUiStrings> = {
  tr: {
    termsTitle: "Kullanım Koşulları",
    termsDescription:
      "ZeytinSaaS zeytinyağı fabrikası yönetim platformunun kullanım koşulları, lisans ve ödeme şartları ile tarafların hak ve yükümlülükleri (taslak şablon).",
    privacyTitle: "Gizlilik Politikası ve Aydınlatma Metni",
    privacyDescription:
      "Kişisel verilerinizin KVKK ve GDPR kapsamında nasıl işlendiğini, saklandığını ve korunduğunu açıklayan gizlilik politikası (taslak şablon).",
    lastUpdatedLabel: "Son güncelleme",
    backToLogin: "Giriş ekranına dön",
  },
  es: {
    termsTitle: "Condiciones de Uso",
    termsDescription:
      "Condiciones de uso de la plataforma de gestión ZeytinSaaS para almazaras: licencia, pago y derechos y obligaciones de las partes (plantilla borrador).",
    privacyTitle: "Política de Privacidad",
    privacyDescription:
      "Política de privacidad que explica cómo se tratan, conservan y protegen sus datos personales conforme al RGPD y la KVKK (plantilla borrador).",
    lastUpdatedLabel: "Última actualización",
    backToLogin: "Volver al inicio de sesión",
  },
  it: {
    termsTitle: "Condizioni d'Uso",
    termsDescription:
      "Condizioni d'uso della piattaforma di gestione ZeytinSaaS per frantoi: licenza, pagamento e diritti e obblighi delle parti (modello in bozza).",
    privacyTitle: "Informativa sulla Privacy",
    privacyDescription:
      "Informativa sulla privacy che spiega come i vostri dati personali sono trattati, conservati e protetti ai sensi del GDPR e della KVKK (modello in bozza).",
    lastUpdatedLabel: "Ultimo aggiornamento",
    backToLogin: "Torna all'accesso",
  },
  pt: {
    termsTitle: "Condições de Utilização",
    termsDescription:
      "Condições de utilização da plataforma de gestão ZeytinSaaS para lagares: licença, pagamento e direitos e obrigações das partes (modelo rascunho).",
    privacyTitle: "Política de Privacidade",
    privacyDescription:
      "Política de privacidade que explica como os seus dados pessoais são tratados, conservados e protegidos ao abrigo do RGPD e da KVKK (modelo rascunho).",
    lastUpdatedLabel: "Última atualização",
    backToLogin: "Voltar ao início de sessão",
  },
};

/** İstenen dil için UI metinlerini döndürür; bilinmeyen dilde varsayılana düşer. */
export function getLegalUi(locale: string): LegalUiStrings {
  return UI[locale as Locale] ?? UI[routing.defaultLocale];
}
