/**
 * Hukuki metinler (Kullanım Koşulları + Gizlilik Politikası) uzun-form içeriktir
 * ve bilinçli olarak `messages/*.json` DIŞINDA tutulur. Her dil için ayrı bir
 * içerik modülü (`./tr`, `./es`, `./it`, `./pt`) bu tipleri dışa aktarır.
 *
 * ÖNEMLİ: Bu metinlerin tamamı TASLAK'tır. Yayınlanmadan önce yetkili bir
 * hukukçu tarafından incelenmeli ve kuruluşa göre uyarlanmalıdır. Şirkete özgü
 * her alan [KÖŞELİ PARANTEZ] içinde yer tutucu olarak bırakılmıştır.
 */

/** Tek bir başlık ve ona ait paragraflardan oluşan bölüm. */
export type Section = {
  heading: string;
  paragraphs: string[];
};

/** Bir dil modülünün dışa aktardığı hukuki içerik sözleşmesi. */
export type LegalContent = {
  /** Görüntülenecek "son güncelleme" tarihi (dile göre biçimlendirilmiş). */
  lastUpdated: string;
  /** Sayfanın en üstünde gösterilecek, dile özgü TASLAK uyarısı. */
  draftDisclaimer: string;
  terms: Section[];
  privacy: Section[];
};
