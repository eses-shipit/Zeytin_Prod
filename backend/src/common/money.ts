import { Prisma } from "@prisma/client";

/** Yağ miktarları gram hassasiyetinde tutulur (Decimal(12,3)). */
export const KG_DP = 3;
/** Para kuruş hassasiyetinde tutulur (Decimal(14,2)). */
export const TL_DP = 2;

export const ROUND = Prisma.Decimal.ROUND_HALF_UP;

export function kg(value: Prisma.Decimal.Value): Prisma.Decimal {
  return new Prisma.Decimal(value).toDecimalPlaces(KG_DP, ROUND);
}

export function tl(value: Prisma.Decimal.Value): Prisma.Decimal {
  return new Prisma.Decimal(value).toDecimalPlaces(TL_DP, ROUND);
}

/**
 * Bir toplamı ağırlıklara göre, toplamı BOZMADAN paylaştırır.
 *
 * Neden gerekli: eski kod her fiş için `ratio = ticket.netKg / totalOliveKg`
 * hesaplayıp `pay = toplam * ratio` yapıyordu. Her pay ayrı ayrı yuvarlandığı
 * için payların toplamı partinin toplamına eşit çıkmıyordu — 3 müşterilik bir
 * partide bir kaç gram, binlerce partide gerçek bir yekûn farkı. Fabrikanın
 * defterinde "dağıtılan yağ" ile "üretilen yağ" birbirini tutmak zorundadır.
 *
 * Yöntem: son pay hariç hepsi yuvarlanır, son pay kalan olarak verilir. Böylece
 * toplam her zaman birebir korunur ve yuvarlama artığı tek bir yerde toplanır.
 *
 * @param total Dağıtılacak toplam.
 * @param weights Ağırlıklar (ör. her fişin netKg değeri). Toplamı 0 olamaz.
 * @param decimalPlaces Payların yuvarlanacağı hane sayısı.
 */
export function splitProportionally(
  total: Prisma.Decimal,
  weights: Prisma.Decimal.Value[],
  decimalPlaces: number,
): Prisma.Decimal[] {
  if (weights.length === 0) return [];

  const decimals = weights.map((w) => new Prisma.Decimal(w));
  const weightSum = decimals.reduce((a, b) => a.add(b), new Prisma.Decimal(0));

  if (weightSum.isZero()) {
    throw new Error("splitProportionally: ağırlıkların toplamı sıfır olamaz.");
  }

  const parts: Prisma.Decimal[] = [];
  let allocated = new Prisma.Decimal(0);

  for (let i = 0; i < decimals.length - 1; i++) {
    const part = total.mul(decimals[i]).div(weightSum).toDecimalPlaces(decimalPlaces, ROUND);
    parts.push(part);
    allocated = allocated.add(part);
  }

  // Kalan: yuvarlama artığı dahil.
  parts.push(total.sub(allocated));

  return parts;
}
