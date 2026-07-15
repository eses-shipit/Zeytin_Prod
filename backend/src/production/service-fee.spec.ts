import { Prisma } from "@prisma/client";
import { ProductionService } from "./production.service";
import { ServiceType } from "./dto/create-production-batch.dto";
import { kg } from "../common/money";

/**
 * Hizmet bedeli hesabı fabrikanın gelirini ve müstahsile ödenecek yağı
 * belirleyen tek yer. Saf bir fonksiyon olduğu için bağımlılıklar mock'lanmadan
 * doğrudan test edilebilir.
 */
describe("calculateServiceFee", () => {
  const service = new ProductionService(
    {} as any, {} as any, {} as any, {} as any, {} as any,
  );
  const calc = (type: ServiceType, amount: number, oliveKg: number, oilKg: number) =>
    (service as any).calculateServiceFee(
      type,
      new Prisma.Decimal(amount),
      kg(oliveKg),
      kg(oilKg),
    );

  describe("PERCENTAGE (hak yağ) — matrah ÇIKAN YAĞ", () => {
    it("%10 hak yağda fabrika çıkan yağın %10'unu alır", () => {
      const { factoryShareKg, customerShareKg, totalPrice } = calc(
        ServiceType.PERCENTAGE, 10, 1000, 200,
      );

      expect(factoryShareKg.toString()).toBe("20");
      expect(customerShareKg.toString()).toBe("180");
      expect(totalPrice.toString()).toBe("0"); // yağdan alınıyor, para yok
    });

    it("paylar toplamı her zaman çıkan yağa eşittir", () => {
      // Yuvarlamanın yağ yaratmadığını/yok etmediğini garanti eder.
      const { factoryShareKg, customerShareKg } = calc(
        ServiceType.PERCENTAGE, 13.5, 3333, 617.777,
      );

      expect(factoryShareKg.add(customerShareKg).toString()).toBe("617.777");
    });

    it("oran 0 olduğunda yağın tamamı müstahsilin kalır", () => {
      const { factoryShareKg, customerShareKg } = calc(ServiceType.PERCENTAGE, 0, 1000, 200);
      expect(factoryShareKg.toString()).toBe("0");
      expect(customerShareKg.toString()).toBe("200");
    });

    it("randıman düştüğünde fabrikanın hak yağı da düşer", () => {
      // Yüzde modelinin tanımlayıcı özelliği: risk paylaşılır.
      const iyiRandiman = calc(ServiceType.PERCENTAGE, 10, 1000, 250);
      const kotuRandiman = calc(ServiceType.PERCENTAGE, 10, 1000, 150);

      expect(iyiRandiman.factoryShareKg.toString()).toBe("25");
      expect(kotuRandiman.factoryShareKg.toString()).toBe("15");
    });
  });

  describe("CASH_PER_KG — matrah GİREN ZEYTİN", () => {
    it("kg başı 2.5 TL'de bedel giren zeytin üzerinden hesaplanır", () => {
      const { factoryShareKg, customerShareKg, totalPrice } = calc(
        ServiceType.CASH_PER_KG, 2.5, 1000, 200,
      );

      expect(totalPrice.toString()).toBe("2500"); // 1000 kg zeytin * 2.5
      expect(factoryShareKg.toString()).toBe("0"); // fabrika yağ almaz
      expect(customerShareKg.toString()).toBe("200"); // yağın tamamı müstahsilin
    });

    it("randıman düşse de nakit bedel değişmez", () => {
      // Nakit modelinin tanımlayıcı özelliği: risk tamamen müstahsilde.
      const iyi = calc(ServiceType.CASH_PER_KG, 2.5, 1000, 250);
      const kotu = calc(ServiceType.CASH_PER_KG, 2.5, 1000, 150);

      expect(iyi.totalPrice.toString()).toBe("2500");
      expect(kotu.totalPrice.toString()).toBe("2500");
      // Ama müstahsilin eline geçen yağ değişir.
      expect(iyi.customerShareKg.toString()).toBe("250");
      expect(kotu.customerShareKg.toString()).toBe("150");
    });

    it("kuruş hassasiyetinde yuvarlar", () => {
      const { totalPrice } = calc(ServiceType.CASH_PER_KG, 2.333, 777, 150);
      // 777 * 2.333 = 1812.741 -> 1812.74
      expect(totalPrice.toString()).toBe("1812.74");
    });
  });

  it("iki model aynı girdide farklı sonuç verir (matrahları farklı)", () => {
    // Bu asimetri bilinçli bir iş kuralı ve fabrikaların asıl tercih farkı.
    const yuzde = calc(ServiceType.PERCENTAGE, 10, 1000, 200);
    const nakit = calc(ServiceType.CASH_PER_KG, 10, 1000, 200);

    expect(yuzde.factoryShareKg.toString()).toBe("20"); // 200 yağın %10'u
    expect(nakit.totalPrice.toString()).toBe("10000"); // 1000 zeytinin kg'ı 10 TL
  });
});
