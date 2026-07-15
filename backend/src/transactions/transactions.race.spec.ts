import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Yarış koşulunun gerçekten kapandığını GERÇEK veritabanına karşı doğrular.
 *
 * Bu testler mock ile yazılamaz: kapatılan hata PostgreSQL'in READ COMMITTED
 * seviyesinde predicate'i yeniden değerlendirmemesinden kaynaklanıyordu. Mock'lu
 * bir test eski kodda da geçerdi.
 *
 * Çalıştırmak için: TEST_DATABASE_URL tanımlı olmalı.
 */
const TEST_DB = process.env.TEST_DATABASE_URL;
const describeIfDb = TEST_DB ? describe : describe.skip;

describeIfDb("Bakiye yarış koşulu (gerçek DB)", () => {
  const prisma = new PrismaClient({ datasources: { db: { url: TEST_DB } } });

  const TENANT = "t_race_test";
  const CUSTOMER = "c_race_test";
  const TANK = "tank_race_test";

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function cleanup() {
    await prisma.transaction.deleteMany({ where: { tenantId: TENANT } });
    await prisma.stockTank.deleteMany({ where: { tenantId: TENANT } });
    await prisma.customer.deleteMany({ where: { tenantId: TENANT } });
    await prisma.tenant.deleteMany({ where: { id: TENANT } });
  }

  beforeEach(async () => {
    await cleanup();
    await prisma.tenant.create({
      data: { id: TENANT, name: "Race Test Fabrikası", code: "RACE" },
    });
    await prisma.customer.create({
      data: {
        id: CUSTOMER,
        name: "Race Test Çiftçi",
        tenantId: TENANT,
        oliveOilBalance: 100, // 100 kg emanet yağ
        balanceTL: 0,
      },
    });
    await prisma.stockTank.create({
      data: { id: TANK, name: "Race Tank", capacity: 1000, currentLevel: 100, tenantId: TENANT },
    });
  });

  /** Servisteki koşullu UPDATE deseninin birebir aynısı. */
  async function withdraw(amountKg: number) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.customer.updateMany({
        where: { id: CUSTOMER, oliveOilBalance: { gte: amountKg } },
        data: { oliveOilBalance: { decrement: amountKg } },
      });
      if (updated.count === 0) throw new Error("Yetersiz yağ bakiyesi.");
      return tx.transaction.create({
        data: { customerId: CUSTOMER, type: "OIL_OUT", amountKg, tenantId: TENANT },
      });
    });
  }

  it("100 kg bakiyeye karşı eşzamanlı iki 60 kg teslimattan yalnızca biri geçer", async () => {
    // Eski "oku -> JS'te kontrol et -> düş" deseninde ikisi de 100 okur, ikisi
    // de kontrolü geçer ve bakiye -20'ye inerdi.
    const results = await Promise.allSettled([withdraw(60), withdraw(60)]);

    const ok = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    expect(ok).toHaveLength(1);
    expect(failed).toHaveLength(1);

    const customer = await prisma.customer.findUniqueOrThrow({ where: { id: CUSTOMER } });
    expect(customer.oliveOilBalance.toString()).toBe("40");
    expect(customer.oliveOilBalance.isNegative()).toBe(false);
  });

  it("10 eşzamanlı 30 kg çekimden tam 3'ü geçer, bakiye negatife düşmez", async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => withdraw(30)),
    );

    const ok = results.filter((r) => r.status === "fulfilled");
    expect(ok).toHaveLength(3); // 100 / 30 -> 3 tam çekim

    const customer = await prisma.customer.findUniqueOrThrow({ where: { id: CUSTOMER } });
    expect(customer.oliveOilBalance.toString()).toBe("10");
  });

  it("hareket kayıtlarının toplamı bakiyedeki düşüşle birebir tutar", async () => {
    await Promise.allSettled(Array.from({ length: 8 }, () => withdraw(25)));

    const customer = await prisma.customer.findUniqueOrThrow({ where: { id: CUSTOMER } });
    const moved = await prisma.transaction.aggregate({
      where: { customerId: CUSTOMER, type: "OIL_OUT" },
      _sum: { amountKg: true },
    });

    // Defter tutarlılığı: çıkan yağ + kalan bakiye = başlangıç bakiyesi.
    const withdrawn = moved._sum.amountKg ?? new Prisma.Decimal(0);
    expect(withdrawn.add(customer.oliveOilBalance).toString()).toBe("100");
  });

  it("veritabanı CHECK kısıtı negatif bakiyeyi son çare olarak reddeder", async () => {
    // Uygulama katmanı atlansa bile veritabanı kabul etmemeli.
    await expect(
      prisma.customer.update({
        where: { id: CUSTOMER },
        data: { oliveOilBalance: { decrement: 500 } },
      }),
    ).rejects.toThrow();
  });

  it("tank seviyesi de eşzamanlı çekimde negatife düşmez", async () => {
    const drawTank = (amount: number) =>
      prisma.stockTank
        .updateMany({
          where: { id: TANK, currentLevel: { gte: amount } },
          data: { currentLevel: { decrement: amount } },
        })
        .then((r) => {
          if (r.count === 0) throw new Error("Tankta yeterli yağ yok.");
        });

    const results = await Promise.allSettled([drawTank(70), drawTank(70)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);

    const tank = await prisma.stockTank.findUniqueOrThrow({ where: { id: TANK } });
    expect(tank.currentLevel.toString()).toBe("30");
  });
});
