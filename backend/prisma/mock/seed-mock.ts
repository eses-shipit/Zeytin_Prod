/**
 * Demo/screenshot verisi üretici.
 *
 * 4 ülke (TR/ES/IT/PT) için gerçekçi çok-fabrikalı veri: fabrikalar, yöneticiler,
 * politikalar, bidon katalogları, ürünler (yerel zeytin çeşitleri), tanklar,
 * müşteriler, kantar fişleri, üretim partileri, işlemler; ayrıca lisanslar,
 * lead'ler ve destek talepleri.
 *
 * TASARIM: tüm grafik önce BELLEKTE, açık id'lerle (randomUUID) kurulur; sonra
 * model başına `createMany` ile toplu eklenir. Böylece:
 *   - Bakiyeler (oliveOilBalance/balanceTL/tank currentLevel) asla negatife
 *     düşmez -> veritabanı CHECK kısıtları ihlal edilmez.
 *   - Binlerce satır tek round-trip'te eklenir (hızlı).
 *
 * Plain PrismaClient kullanır (Nest DI dışında), yani tenant middleware devrede
 * DEĞİL; her satıra tenantId açıkça yazılır.
 *
 * Çalıştırma:  DATABASE_URL=... npx ts-node prisma/mock/seed-mock.ts
 * Yeniden çalıştırılabilir: aynı fabrika kodları önce silinir.
 */
import { PrismaClient, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import { trSeed } from "./data-tr";
import { esSeed } from "./data-es";
import { itSeed } from "./data-it";
import { ptSeed } from "./data-pt";
import type { CountrySeed, FactorySeed } from "./types";

const prisma = new PrismaClient();

// Tüm demo yöneticileri bu şifreyle girer (kullanıcı her fabrikayı gezebilsin).
const DEMO_PASSWORD = "Zeytin2026!";

// ---- Rastgelelik yardımcıları (deterministik değil; her koşuda taze) ----
const rnd = () => Math.random();
const randInt = (min: number, max: number) => Math.floor(min + rnd() * (max - min + 1));
const pick = <T>(a: T[]): T => a[Math.floor(rnd() * a.length)];
const chance = (p: number) => rnd() < p;
const round = (n: number, dp: number) => Number(n.toFixed(dp));
const daysAgo = (d: number) => new Date(Date.now() - d * 86400_000);

const QUALITIES = ["TREE", "GROUND", "MIXED"] as const;
const OIL_TYPES = ["ACID_03", "ACID_05", "ACID_08", "VIRGIN"] as const;
const DRUM_TYPES = ["PLASTIC", "CHROME", "TIN"] as const;

type Rows = {
  tenants: Prisma.TenantCreateManyInput[];
  users: Prisma.UserCreateManyInput[];
  policies: Prisma.TenantPolicyCreateManyInput[];
  drumSizes: Prisma.DrumSizeCreateManyInput[];
  products: Prisma.ProductCreateManyInput[];
  tanks: Prisma.StockTankCreateManyInput[];
  customers: Prisma.CustomerCreateManyInput[];
  tickets: Prisma.WeighingTicketCreateManyInput[];
  batches: Prisma.ProductionBatchCreateManyInput[];
  transactions: Prisma.TransactionCreateManyInput[];
  licenses: Prisma.LicenseCreateManyInput[];
  leads: Prisma.LeadCreateManyInput[];
  supportTickets: Prisma.SupportTicketCreateManyInput[];
  ticketMessages: Prisma.TicketMessageCreateManyInput[];
};

const rows: Rows = {
  tenants: [], users: [], policies: [], drumSizes: [], products: [], tanks: [],
  customers: [], tickets: [], batches: [], transactions: [], licenses: [],
  leads: [], supportTickets: [], ticketMessages: [],
};

function buildFactory(country: CountrySeed, f: FactorySeed) {
  const tenantId = randomUUID();
  const createdAt = daysAgo(randInt(150, 220));

  rows.tenants.push({
    id: tenantId,
    name: f.name,
    officialName: f.officialName,
    taxId: `${f.code}-${randInt(1000000000, 9999999999)}`,
    address: `${pick(country.villages)}, ${f.city}`,
    city: f.city,
    code: f.code,
    status: "ACTIVE",
    subscriptionEndDate: daysAgo(randInt(-300, -30)), // gelecekte biten abonelik
    defaultDrumWeight: pick([18, 25, 50, 60]),
    createdAt,
    updatedAt: createdAt,
  });

  // Yönetici
  rows.users.push({
    id: randomUUID(),
    email: `admin@${f.code.toLowerCase()}.demo`,
    password: "__HASH__", // sonra topluca hash'lenir
    name: `${pick(country.customerFirstNames)} ${pick(country.customerLastNames)}`,
    phone: `+90 5${randInt(30, 55)} ${randInt(100, 999)} ${randInt(1000, 9999)}`,
    role: "ADMIN",
    tenantId,
    acceptedTermsAt: createdAt,
    createdAt,
    updatedAt: createdAt,
  });

  // Politika (para birimi ülkeye göre; oran/tip çeşitli)
  const usesCash = chance(0.25);
  rows.policies.push({
    id: randomUUID(),
    tenantId,
    version: 1,
    isActive: true,
    defaultServiceType: usesCash ? "CASH_PER_KG" : "PERCENTAGE",
    defaultServiceAmount: usesCash ? pick([2.5, 3, 3.5, 4]) : pick([8, 9, 10, 11, 12]),
    percentageBasis: chance(0.15) ? "OLIVE_IN" : "OIL_OUT",
    allowServiceOverride: true,
    escrowEnabled: true,
    escrowDefault: chance(0.6),
    escrowModel: "FUNGIBLE",
    allowNegativeBalance: chance(0.7),
    liquidationPriceSource: "PER_TRANSACTION",
    messageAutomationEnabled: chance(0.4),
    currency: country.currency,
    createdAt,
  });

  // Bidon katalogu (2-3)
  const drumDefs = [
    { name: country.locale === "tr" ? "5'lik teneke" : "Lata 5L", cap: 5, tare: 0.4, type: "TIN" },
    { name: country.locale === "tr" ? "18'lik teneke" : "Lata 18L", cap: 18, tare: 1.1, type: "TIN" },
    { name: country.locale === "tr" ? "Plastik bidon" : "Bidón plástico", cap: pick([25, 30, 50]), tare: 2, type: "PLASTIC" },
  ];
  drumDefs.slice(0, randInt(2, 3)).forEach((d, i) =>
    rows.drumSizes.push({
      id: randomUUID(), tenantId, name: d.name, capacityKg: d.cap, tareKg: d.tare,
      type: d.type as any, isActive: true, isDefault: i === 0, createdAt, updatedAt: createdAt,
    }),
  );

  // Ürünler = yerel zeytin çeşitleri
  const productIds = f.varieties.map((v) => {
    const id = randomUUID();
    rows.products.push({ id, name: v, isActive: true, tenantId, createdAt, updatedAt: createdAt });
    return id;
  });

  // Tanklar
  const tanks = f.tankNames.map((tn) => ({
    id: randomUUID(), name: tn, capacity: pick([5000, 8000, 10000, 15000]),
    level: 0, type: pick(OIL_TYPES),
  }));

  // Müşteriler
  const custCount = randInt(16, 30);
  const customers = Array.from({ length: custCount }).map(() => {
    const id = randomUUID();
    const cCreated = daysAgo(randInt(30, 200));
    return {
      id,
      name: `${pick(country.customerFirstNames)} ${pick(country.customerLastNames)}`,
      phone: `05${randInt(30, 55)}${randInt(1000000, 9999999)}`,
      tckn: country.locale === "tr" ? String(randInt(10000000000, 99999999999)) : null,
      village: pick(country.villages),
      oilKg: 0, tl: 0, createdAt: cCreated,
    };
  });

  // Üretim seansları
  let seq = 1;
  // Fabrika içinde benzersiz publicId (fiş + parti aynı sayaçtan artar).
  const pub = (w: Date) =>
    `${String(w.getFullYear()).slice(2)}-${String(seq++).padStart(4, "0")}-${randomUUID().slice(0, 3).toUpperCase()}`;
  const sessionCount = randInt(14, 26);
  for (let s = 0; s < sessionCount; s++) {
    const when = daysAgo(randInt(1, 140));
    const nTickets = randInt(1, 3);
    const sessionCustomers = Array.from({ length: nTickets }).map(() => pick(customers));
    const ticketRows = sessionCustomers.map((c) => {
      const gross = randInt(400, 3500);
      const tare = randInt(20, 120);
      const net = gross - tare;
      const tId = randomUUID();
      rows.tickets.push({
        id: tId,
        publicId: pub(when),
        customerId: c.id, grossKg: gross, tareKg: tare, netKg: net,
        origin: c.village, productId: pick(productIds), quality: pick(QUALITIES) as any,
        status: "COMPLETED", tenantId, createdAt: when, updatedAt: when,
      });
      return { customerRef: c, net, ticketId: tId };
    });

    const totalOlive = ticketRows.reduce((a, t) => a + t.net, 0);
    const yieldRatio = round(pick([3.0, 3.2, 3.5, 3.8, 4.0, 4.3, 4.6, 5.0]) + rnd() * 0.4, 3);
    const totalOil = round(totalOlive / yieldRatio, 3);
    const acid = round(0.2 + rnd() * 0.6, 2);
    const isCash = chance(0.25);
    const rate = isCash ? pick([2.5, 3, 3.5]) : pick([8, 9, 10, 11, 12]);
    const factoryShare = isCash ? 0 : round(totalOil * (rate / 100), 3);
    const customerShare = round(totalOil - factoryShare, 3);
    const totalPrice = isCash ? round(totalOlive * rate, 2) : 0;
    const escrow = chance(0.6);
    const batchId = randomUUID();
    const tank = pick(tanks);

    rows.batches.push({
      id: batchId,
      publicId: pub(when),
      totalOliveKg: totalOlive, totalOilKg: totalOil, acidRatio: acid, yieldRatio,
      status: escrow ? "COMPLETED" : "DELIVERED",
      serviceType: isCash ? "CASH_PER_KG" : "PERCENTAGE", serviceAmount: rate, totalPrice,
      processTemp: randInt(24, 30), lineId: randInt(1, 3), filtration: chance(0.5),
      storedInEscrow: escrow, factoryShareKg: factoryShare, customerShareKg: customerShare,
      tankId: tank.id, tenantId, createdAt: when, updatedAt: when,
    });

    // Fişleri partiye bağla
    ticketRows.forEach((t) => {
      const tk = rows.tickets.find((x) => x.id === t.ticketId)!;
      (tk as any).batchId = batchId;
    });

    // Tanka fabrika payı (+ emanette müşteri payı da tankta bekler)
    tank.level = round(tank.level + (escrow ? totalOil : factoryShare), 3);

    // Müşteri payı dağıtımı + OIL_IN
    ticketRows.forEach((t) => {
      const share = round(customerShare * (t.net / totalOlive), 3);
      rows.transactions.push({
        id: randomUUID(), customerId: t.customerRef.id, type: "OIL_IN", amountKg: share,
        description: `Üretim payı`, batchId, tenantId, createdAt: when, updatedAt: when,
      });
      if (escrow) {
        t.customerRef.oilKg = round(t.customerRef.oilKg + share, 3);
      } else {
        // Peşin teslim: yağ geri çıkar (net sıfır bakiye)
        rows.transactions.push({
          id: randomUUID(), customerId: t.customerRef.id, type: "OIL_OUT", amountKg: share,
          description: `Peşin teslimat`, batchId, tenantId, createdAt: when, updatedAt: when,
        });
      }
      if (isCash) {
        const cost = round(totalPrice * (t.net / totalOlive), 2);
        t.customerRef.tl = round(t.customerRef.tl + cost, 2);
        rows.transactions.push({
          id: randomUUID(), customerId: t.customerRef.id, type: "SERVICE_FEE", amountTL: cost,
          description: `Sıkım bedeli`, batchId, tenantId, createdAt: when, updatedAt: when,
        });
      }
    });
  }

  // Bazı bozdurmalar (yağ -> TL) — bakiye elverdiği kadar
  customers.forEach((c) => {
    if (c.oilKg > 5 && chance(0.3)) {
      const amt = round(c.oilKg * (0.3 + rnd() * 0.5), 3);
      const unit = country.currency === "TRY" ? pick([180, 200, 220, 240]) : pick([6, 7, 8]);
      const tl = round(amt * unit, 2);
      c.oilKg = round(c.oilKg - amt, 3);
      c.tl = round(c.tl + tl, 2);
      const when = daysAgo(randInt(1, 40));
      rows.transactions.push({
        id: randomUUID(), customerId: c.id, type: "LIQUIDATION", amountKg: amt, amountTL: tl,
        unitPrice: unit, description: `Bozdurma`, tenantId, createdAt: when, updatedAt: when,
      });
    }
    // Bazı tahsilatlar (borç varsa)
    if (c.tl > 0 && chance(0.4)) {
      const pay = round(c.tl * (0.4 + rnd() * 0.6), 2);
      c.tl = round(c.tl - pay, 2);
      const when = daysAgo(randInt(1, 30));
      rows.transactions.push({
        id: randomUUID(), customerId: c.id, type: "PAYMENT", amountTL: pay,
        description: `Tahsilat`, tenantId, createdAt: when, updatedAt: when,
      });
    }
  });

  // Tankları ve müşterileri nihai bakiyelerle ekle
  tanks.forEach((tk) =>
    rows.tanks.push({
      id: tk.id, name: tk.name, capacity: tk.capacity, currentLevel: tk.level,
      type: tk.type as any, acidRatio: round(0.3 + rnd() * 0.4, 2), tenantId, createdAt, updatedAt: createdAt,
    }),
  );
  customers.forEach((c) =>
    rows.customers.push({
      id: c.id, name: c.name, phone: c.phone, tckn: c.tckn, village: c.village,
      oliveOilBalance: Math.max(0, c.oilKg), balanceTL: Math.max(0, c.tl),
      tenantId, createdAt: c.createdAt, updatedAt: c.createdAt,
    }),
  );

  // Bazı fabrikalara destek talepleri
  if (chance(0.5)) {
    const stId = randomUUID();
    const when = daysAgo(randInt(1, 40));
    const subjects = ["Kantar bağlantı sorunu", "Fatura hakkında soru", "Yeni kullanıcı ekleme", "SMS gönderimi", "Rapor dışa aktarımı"];
    rows.supportTickets.push({
      id: stId, tenantId, subject: pick(subjects), priority: pick(["LOW", "NORMAL", "HIGH", "URGENT"]) as any,
      status: pick(["OPEN", "IN_PROGRESS", "RESOLVED"]) as any, createdAt: when, updatedAt: when,
    });
    rows.ticketMessages.push({
      id: randomUUID(), ticketId: stId, message: "Merhaba, bu konuda yardımcı olur musunuz?", sender: "CUSTOMER", createdAt: when,
    });
  }

  return { tenantId, code: f.code };
}

async function wipeExisting(codes: string[]) {
  const tenants = await prisma.tenant.findMany({ where: { code: { in: codes } }, select: { id: true } });
  const ids = tenants.map((t) => t.id);
  if (ids.length === 0) return;
  const userIds = (await prisma.user.findMany({ where: { tenantId: { in: ids } }, select: { id: true } })).map((u) => u.id);

  // Bağımlılık sırasına göre sil (FK RESTRICT).
  await prisma.passwordResetToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.transaction.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.ticketMessage.deleteMany({ where: { ticket: { tenantId: { in: ids } } } });
  await prisma.supportTicket.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.weighingTicket.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.productionBatch.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.drum.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.drumSize.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.stockTank.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.dailyOilPrice.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.customer.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.product.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.tenantPolicy.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.auditLog.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.license.updateMany({ where: { tenantId: { in: ids } }, data: { tenantId: null, status: "UNUSED" } });
  await prisma.license.deleteMany({ where: { code: { startsWith: "DEMO-" } } });
  await prisma.lead.deleteMany({ where: { email: { endsWith: "@demo-lead.test" } } });
  await prisma.user.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.tenant.deleteMany({ where: { id: { in: ids } } });
}

function buildGlobals(countries: CountrySeed[]) {
  // Lisanslar (admin/licenses ekranı)
  for (let i = 0; i < 18; i++) {
    rows.licenses.push({
      id: randomUUID(),
      code: `DEMO-${2026}-${randomUUID().slice(0, 8).toUpperCase()}`,
      status: chance(0.35) ? "USED" : "UNUSED",
      planDurationDays: pick([365, 730]),
      createdAt: daysAgo(randInt(1, 120)),
      updatedAt: daysAgo(randInt(1, 60)),
    });
  }
  // Lead'ler (admin/leads ekranı)
  const interests = ["DEMO", "STANDARD", "PRO"];
  const statuses = ["NEW", "CONTACTED", "CONVERTED", "REJECTED"];
  countries.forEach((c) => {
    for (let i = 0; i < 4; i++) {
      const name = `${pick(c.customerFirstNames)} ${pick(c.customerLastNames)}`;
      rows.leads.push({
        id: randomUUID(), name,
        email: `${name.split(" ")[0].toLowerCase()}${randInt(1, 99)}@demo-lead.test`,
        phone: `+${randInt(30, 39)} ${randInt(600, 699)} ${randInt(100000, 999999)}`,
        factoryName: pick(c.factories).name, city: pick(c.factories).city,
        message: "Ürününüzle ilgileniyorum, bilgi alabilir miyim?",
        interest: pick(interests), locale: c.locale, status: pick(statuses) as any,
        createdAt: daysAgo(randInt(1, 45)), updatedAt: daysAgo(randInt(1, 20)),
      });
    }
  });
}

async function main() {
  const countries = [trSeed, esSeed, itSeed, ptSeed];
  const allCodes = countries.flatMap((c) => c.factories.map((f) => f.code));

  console.log("🧹 Önceki demo verisi temizleniyor...");
  await wipeExisting(allCodes);

  console.log("🏭 Fabrikalar üretiliyor (bellek)...");
  countries.forEach((c) => c.factories.forEach((f) => buildFactory(c, f)));
  buildGlobals(countries);

  // Yönetici parolalarını topluca hash'le
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  rows.users.forEach((u) => (u.password = hash));

  console.log("💾 Toplu ekleme...");
  await prisma.tenant.createMany({ data: rows.tenants });
  await prisma.user.createMany({ data: rows.users });
  await prisma.tenantPolicy.createMany({ data: rows.policies });
  await prisma.drumSize.createMany({ data: rows.drumSizes });
  await prisma.product.createMany({ data: rows.products });
  await prisma.stockTank.createMany({ data: rows.tanks });
  await prisma.customer.createMany({ data: rows.customers });
  // Parti önce: WeighingTicket.batchId ve Transaction.batchId partiye referans verir.
  await prisma.productionBatch.createMany({ data: rows.batches });
  await prisma.weighingTicket.createMany({ data: rows.tickets });
  await prisma.transaction.createMany({ data: rows.transactions });
  await prisma.license.createMany({ data: rows.licenses });
  await prisma.lead.createMany({ data: rows.leads });
  await prisma.supportTicket.createMany({ data: rows.supportTickets });
  await prisma.ticketMessage.createMany({ data: rows.ticketMessages });

  console.log("\n✅ Demo verisi hazır:");
  console.log(`   Fabrika: ${rows.tenants.length}`);
  console.log(`   Müşteri: ${rows.customers.length}`);
  console.log(`   Fiş: ${rows.tickets.length} | Parti: ${rows.batches.length} | İşlem: ${rows.transactions.length}`);
  console.log(`   Lisans: ${rows.licenses.length} | Lead: ${rows.leads.length} | Destek: ${rows.supportTickets.length}`);
  console.log(`\n   Her fabrika yöneticisi:  admin@<kod>.demo  /  ${DEMO_PASSWORD}`);
  console.log(`   Örn: admin@${rows.tenants[0].code?.toLowerCase()}.demo`);
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
