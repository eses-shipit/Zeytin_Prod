import { localeToBcp47, routing, type Locale } from "@/i18n/routing";

/**
 * Dil-farkında biçimlendirme yardımcıları.
 *
 * NEDEN BU DOSYA VAR:
 * Kod tabanında 32 yerde elle yazılmış `toLocaleString("tr-TR")` ve 5 yerde
 * string olarak eklenmiş `₺` vardı. İkisi de İspanyol/İtalyan/Portekizli bir
 * kullanıcı için yanlış çıktı üretir (ondalık ayracı, binlik ayracı, sembol
 * konumu ve para biriminin kendisi).
 *
 * KURAL 1: Bu dosyanın dışında `toLocaleString` / `toLocaleDateString` YOK.
 * KURAL 2: Para birimi HER ZAMAN parametre. `₺` veya "TRY" sabitlemek yasak —
 *          tenant'ın kendi para birimi var (backend: Tenant.currency, TRY|EUR).
 *
 * `Intl.*Format` nesnesi kurmak pahalıdır; tablolarda satır başına çağrıldığı
 * için basit bir cache ile örnekleri paylaşıyoruz.
 */

/** Backend `Tenant.currency` alanının karşılığı (prisma default: "TRY"). */
export type CurrencyCode = "TRY" | "EUR";

export const DEFAULT_CURRENCY: CurrencyCode = "TRY";

/** Geçersiz/eksik dil gelirse varsayılana düş — biçimlendirme asla patlamamalı. */
function resolveBcp47(locale: Locale | string | undefined): string {
  if (locale && locale in localeToBcp47) {
    return localeToBcp47[locale as Locale];
  }
  return localeToBcp47[routing.defaultLocale];
}

const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateFormatCache = new Map<string, Intl.DateTimeFormat>();

function getNumberFormat(
  bcp47: string,
  options: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const key = bcp47 + JSON.stringify(options);
  let formatter = numberFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(bcp47, options);
    numberFormatCache.set(key, formatter);
  }
  return formatter;
}

function getDateFormat(
  bcp47: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = bcp47 + JSON.stringify(options);
  let formatter = dateFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(bcp47, options);
    dateFormatCache.set(key, formatter);
  }
  return formatter;
}

/**
 * Para birimi. Sembolü ve konumunu dil belirler:
 *   formatCurrency(1234.5, "TRY", "tr") -> "₺1.234,50"
 *   formatCurrency(1234.5, "EUR", "es") -> "1234,50 €"
 *
 * @param currency Tenant'ın para birimi. ASLA sabitleme — API'den/tenant'tan gelmeli.
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: CurrencyCode | string = DEFAULT_CURRENCY,
  locale?: Locale | string
): string {
  const amount = Number(value ?? 0);
  return getNumberFormat(resolveBcp47(locale), {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/** Genel sayı. `options` ile ondalık basamak vb. geçilebilir. */
export function formatNumber(
  value: number | null | undefined,
  locale?: Locale | string,
  options: Intl.NumberFormatOptions = {}
): string {
  const num = Number(value ?? 0);
  return getNumberFormat(resolveBcp47(locale), options).format(
    Number.isFinite(num) ? num : 0
  );
}

/**
 * Kilogram. "kg" SI birimi olduğu için çevrilmez ama boşluk/konum dile göre
 * değişir; bu yüzden elle string eklemek yerine Intl'in unit desteğini kullanıyoruz.
 *
 * @param digits Sabit ondalık basamak. Verilmezse en fazla 1 basamak gösterilir.
 */
export function formatKg(
  value: number | null | undefined,
  locale?: Locale | string,
  options: { digits?: number } = {}
): string {
  const num = Number(value ?? 0);
  const { digits } = options;
  return getNumberFormat(resolveBcp47(locale), {
    style: "unit",
    unit: "kilogram",
    unitDisplay: "short",
    ...(digits === undefined
      ? { maximumFractionDigits: 1 }
      : { minimumFractionDigits: digits, maximumFractionDigits: digits }),
  }).format(Number.isFinite(num) ? num : 0);
}

/**
 * Tarih. Varsayılan "short" = sadece gün/ay/yıl.
 *   formatDate(d, "tr") -> "15.07.2026"
 *   formatDate(d, "es") -> "15/7/2026"
 */
export function formatDate(
  value: Date | string | number | null | undefined,
  locale?: Locale | string,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }
): string {
  if (value === null || value === undefined || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  // Geçersiz tarih "Invalid Date" basmasın; API'den bozuk string gelebiliyor.
  if (Number.isNaN(date.getTime())) return "";
  return getDateFormat(resolveBcp47(locale), options).format(date);
}

/** Tarih + saat. Fiş/parti listelerinde işlem zamanı için. */
export function formatDateTime(
  value: Date | string | number | null | undefined,
  locale?: Locale | string
): string {
  return formatDate(value, locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Yüzde. `value` oran DEĞİL, zaten yüzde cinsinden sayı (ör. 23.4 -> "%23,4"). */
export function formatPercent(
  value: number | null | undefined,
  locale?: Locale | string,
  digits = 1
): string {
  const num = Number(value ?? 0);
  return getNumberFormat(resolveBcp47(locale), {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format((Number.isFinite(num) ? num : 0) / 100);
}
