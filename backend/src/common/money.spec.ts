import { Prisma } from "@prisma/client";
import { kg, tl, splitProportionally, KG_DP, TL_DP } from "./money";

const D = (v: Prisma.Decimal.Value) => new Prisma.Decimal(v);
const sum = (parts: Prisma.Decimal[]) => parts.reduce((a, b) => a.add(b), D(0));

describe("splitProportionally", () => {
  it("toplamı bozmadan paylaştırır (3'e bölünmeyen klasik durum)", () => {
    // 100 kg'ı eşit üç fişe bölmek 33.333... verir; her pay ayrı yuvarlansaydı
    // toplam 99.999 çıkar ve 1 gram buharlaşırdı.
    const parts = splitProportionally(kg(100), [1, 1, 1], KG_DP);

    expect(sum(parts).toString()).toBe("100");
    expect(parts).toHaveLength(3);
  });

  it("ağırlıklara orantılı dağıtır", () => {
    const parts = splitProportionally(kg(1000), [100, 300], KG_DP);

    expect(parts[0].toString()).toBe("250");
    expect(parts[1].toString()).toBe("750");
    expect(sum(parts).toString()).toBe("1000");
  });

  it("yuvarlama artığını son paya verir, toplam yine birebir korunur", () => {
    const total = kg(10);
    const parts = splitProportionally(total, [1, 1, 1], KG_DP);

    // İlk ikisi yuvarlanır, sonuncusu kalanı alır.
    expect(parts[0].toString()).toBe("3.333");
    expect(parts[1].toString()).toBe("3.333");
    expect(parts[2].toString()).toBe("3.334");
    expect(sum(parts).equals(total)).toBe(true);
  });

  it("para dağıtımında da toplam korunur", () => {
    const parts = splitProportionally(tl(100), [1, 1, 1], TL_DP);

    expect(sum(parts).toString()).toBe("100");
    expect(parts[2].toString()).toBe("33.34");
  });

  it("tek fişte tüm toplamı verir", () => {
    const parts = splitProportionally(kg(742.519), [500], KG_DP);
    expect(parts[0].toString()).toBe("742.519");
  });

  it("boş ağırlık listesinde boş döner", () => {
    expect(splitProportionally(kg(10), [], KG_DP)).toEqual([]);
  });

  it("ağırlık toplamı sıfırsa sessizce yanlış sonuç üretmez", () => {
    expect(() => splitProportionally(kg(10), [0, 0], KG_DP)).toThrow(/sıfır olamaz/);
  });

  it("çok sayıda fişte bile kuruş kaçırmaz", () => {
    // 7 fişe bölünen 1000.01 TL: her biri ayrı yuvarlansaydı toplam sapardı.
    const weights = [13, 29, 7, 101, 3, 61, 17];
    const parts = splitProportionally(tl(1000.01), weights, TL_DP);

    expect(sum(parts).toString()).toBe("1000.01");
  });
});

describe("Float ile Decimal farkı", () => {
  it("Float'ta kaybolan bakiye Decimal'de kaybolmaz", () => {
    // Bu, şemadaki Float'ın somut sonucu: 0.1 + 0.2 !== 0.3
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(kg(0.1).add(kg(0.2)).equals(kg(0.3))).toBe(true);
  });

  it("tekrarlanan artırma/azaltmada bakiye sürüklenmez", () => {
    // Emanet bakiyesi binlerce kez artırılıp azaltılır. Float'ta hata birikir.
    let float = 0;
    let decimal = kg(0);

    for (let i = 0; i < 1000; i++) {
      float += 0.001;
      decimal = decimal.add(kg(0.001));
    }

    expect(float).not.toBe(1); // 0.9999999999999062
    expect(decimal.toString()).toBe("1");
  });
});
