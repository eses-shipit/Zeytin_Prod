/**
 * Ülke bazlı demo veri sözleşmesi.
 *
 * Her ülke subagent'ı bu tipe uygun bir `CountrySeed` nesnesi üretir; ekleme
 * mantığı (fabrika/müşteri/fiş/parti/işlem oluşturma, bakiye kuralları) merkezî
 * orchestrator'dadır. Subagent SADECE ÖZGÜN İÇERİK doldurur — Prisma/DB kodu YOK.
 */

export type FactorySeed = {
  /** Gerçekçi fabrika ünvanı (o ülkenin diline/kültürüne uygun). */
  name: string;
  /** Resmî unvan (Ltd./S.A./S.r.l./Lda. gibi). */
  officialName: string;
  /** 3 harfli benzersiz kısa kod (BÜYÜK harf). Ülke önekiyle çakışmayı azalt. */
  code: string;
  /** Şehir/bölge (zeytin bölgesi olması iyi). */
  city: string;
  /**
   * Bu fabrikanın işlediği zeytin ÇEŞİTLERİ — o ülkenin GERÇEK yerel adlarıyla.
   * (TR: Ayvalık, Memecik, Gemlik... / ES: Picual, Arbequina, Hojiblanca... /
   *  IT: Frantoio, Leccino, Coratina... / PT: Galega, Cobrançosa, Cordovil...)
   * 3-6 çeşit.
   */
  varieties: string[];
  /** 2-4 tank adı (ör. "Tank A", "Depo 1", asit sınıfına göre isimlendirme serbest). */
  tankNames: string[];
};

export type CountrySeed = {
  locale: "tr" | "es" | "it" | "pt";
  currency: "TRY" | "EUR";
  /** 5-7 fabrika. */
  factories: FactorySeed[];
  /** Gerçek yaygın ERKEK/KADIN adları (o ülke). En az 25. */
  customerFirstNames: string[];
  /** Gerçek yaygın SOYADLARI (o ülke). En az 25. */
  customerLastNames: string[];
  /** Gerçek köy/mevkii/yerleşim adları (fişlerde "origin" olarak). En az 20. */
  villages: string[];
};
