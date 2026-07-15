import { PrismaClient, ServiceType, FeeBasis } from "@prisma/client";

/**
 * Politikanın SÜRÜMLENMESİNİN asıl gerekçesini gerçek veritabanına karşı
 * doğrular: fabrika oranını sezon ortasında değiştirdiğinde eski partilerin
 * makbuzu DEĞİŞMEMELİ.
 *
 * Çalıştırmak için: TEST_DATABASE_URL tanımlı olmalı.
 */
const TEST_DB = process.env.TEST_DATABASE_URL;
const describeIfDb = TEST_DB ? describe : describe.skip;

describeIfDb("Politika sürümleme (gerçek DB)", () => {
  const prisma = new PrismaClient({ datasources: { db: { url: TEST_DB } } });
  const TENANT = "t_policy_test";

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function cleanup() {
    await prisma.productionBatch.deleteMany({ where: { tenantId: TENANT } });
    await prisma.tenantPolicy.deleteMany({ where: { tenantId: TENANT } });
    await prisma.tenant.deleteMany({ where: { id: TENANT } });
  }

  beforeEach(async () => {
    await cleanup();
    await prisma.tenant.create({ data: { id: TENANT, name: "Politika Test", code: "POL" } });
  });

  const createPolicy = (version: number, amount: number, isActive = true) =>
    prisma.tenantPolicy.create({
      data: {
        tenantId: TENANT,
        version,
        isActive,
        defaultServiceType: ServiceType.PERCENTAGE,
        defaultServiceAmount: amount,
      },
    });

  const createBatch = (publicId: string, policyId: string, serviceAmount: number) =>
    prisma.productionBatch.create({
      data: {
        publicId,
        tenantId: TENANT,
        policyId,
        totalOliveKg: 1000,
        totalOilKg: 200,
        yieldRatio: 5,
        serviceType: ServiceType.PERCENTAGE,
        serviceAmount,
        factoryShareKg: (200 * serviceAmount) / 100,
        customerShareKg: 200 - (200 * serviceAmount) / 100,
      },
    });

  it("oran değişince ESKİ partinin payları aynı kalır", async () => {
    // Ekim: fabrika %10 hak yağ uyguluyor.
    const v1 = await createPolicy(1, 10);
    const ekimPartisi = await createBatch("26-0001-AAA", v1.id, 10);

    expect(ekimPartisi.factoryShareKg.toString()).toBe("20");

    // Kasım: fabrika oranı %15'e çıkarıyor -> YENİ sürüm, eski güncellenmiyor.
    await prisma.tenantPolicy.updateMany({
      where: { tenantId: TENANT, isActive: true },
      data: { isActive: false },
    });
    const v2 = await createPolicy(2, 15);

    // Ekim partisi hâlâ kendi sürümüne bağlı ve sayıları değişmedi.
    const yeniden = await prisma.productionBatch.findUniqueOrThrow({
      where: { id: ekimPartisi.id },
      include: { policy: true },
    });

    expect(yeniden.policyId).toBe(v1.id);
    expect(yeniden.policy!.version).toBe(1);
    expect(yeniden.policy!.defaultServiceAmount.toString()).toBe("10");
    expect(yeniden.factoryShareKg.toString()).toBe("20"); // %15'e göre 30 olurdu
    expect(v2.version).toBe(2);
  });

  it("eski sürüm silinmez; geçmiş okunabilir kalır", async () => {
    const v1 = await createPolicy(1, 10);
    await prisma.tenantPolicy.updateMany({
      where: { tenantId: TENANT, isActive: true },
      data: { isActive: false },
    });
    await createPolicy(2, 15);

    const history = await prisma.tenantPolicy.findMany({
      where: { tenantId: TENANT },
      orderBy: { version: "asc" },
    });

    expect(history).toHaveLength(2);
    expect(history[0].isActive).toBe(false);
    expect(history[0].defaultServiceAmount.toString()).toBe("10");
    expect(history[1].isActive).toBe(true);
    expect(v1.id).toBe(history[0].id); // aynı satır, üzerine yazılmadı
  });

  it("fabrika başına aynı sürüm numarası iki kez olamaz", async () => {
    await createPolicy(1, 10);
    await expect(createPolicy(1, 12, false)).rejects.toThrow();
  });

  it("yeni parti yürürlükteki sürüme bağlanır", async () => {
    await createPolicy(1, 10, false);
    const v2 = await createPolicy(2, 15);

    const active = await prisma.tenantPolicy.findFirstOrThrow({
      where: { tenantId: TENANT, isActive: true },
    });
    const batch = await createBatch("26-0002-BBB", active.id, 15);

    expect(batch.policyId).toBe(v2.id);
    expect(batch.factoryShareKg.toString()).toBe("30");
  });

  it("politika sistemi öncesi partiler policyId olmadan durabilir", async () => {
    // Migration eski partilere bilerek sürüm iliştirmiyor: uygulanmamış bir
    // kuralı uygulanmış göstermek yanlış olurdu.
    const eski = await prisma.productionBatch.create({
      data: {
        publicId: "26-0000-OLD",
        tenantId: TENANT,
        totalOliveKg: 500,
        totalOilKg: 100,
        yieldRatio: 5,
        serviceAmount: 10,
        factoryShareKg: 10,
        customerShareKg: 90,
      },
    });

    expect(eski.policyId).toBeNull();
  });

  it("varsayılan matrah OIL_OUT: kodun eski sabit varsayımıyla aynı", async () => {
    const v1 = await createPolicy(1, 10);
    expect(v1.percentageBasis).toBe(FeeBasis.OIL_OUT);
    expect(v1.currency).toBe("TRY");
    expect(v1.escrowEnabled).toBe(true);
  });
});
