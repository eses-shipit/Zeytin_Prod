import { PrismaClient, UserRole, LicenseStatus, TenantStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Temizlik - Foreign key sırasına dikkat et
  console.log("🧹 Cleaning existing data...");

  await prisma.transaction.deleteMany();
  await prisma.productionBatch.deleteMany();
  await prisma.weighingTicket.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.stockTank.deleteMany();
  await prisma.drum.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.license.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // 2. Ortak şifre (bcrypt)
  const plainPassword = "123123";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  // 3. Lisans oluştur
  console.log("🎫 Creating demo license...");
  const license = await prisma.license.create({
    data: {
      code: "DEMO-KEY-2026",
      status: LicenseStatus.USED,
      planDurationDays: 365,
    },
  });

  // 4. Demo Tenant (Fabrika)
  console.log("🏭 Creating demo tenant...");
  const subscriptionEndDate = new Date();
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 365);

  const tenant = await prisma.tenant.create({
    data: {
      name: "Demo Zeytin Fabrikası",
      officialName: "Demo Zeytin Fabrikası Ltd. Şti.",
      taxId: "1234567890",
      address: "Demo Mah. Zeytin Sok. No:1",
      city: "Ayvalık",
      code: "DEMO01",
      status: TenantStatus.ACTIVE,
      subscriptionEndDate,
      defaultDrumWeight: 50.0,
      licenses: {
        connect: { id: license.id },
      },
    },
  });

  // Lisansı tenant'a bağla
  await prisma.license.update({
    where: { id: license.id },
    data: {
      tenantId: tenant.id,
      status: LicenseStatus.USED,
    },
  });

  // 5. Fabrika Admin Kullanıcısı
  console.log("👤 Creating factory admin user...");
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@demo.com",
      name: "Demo Fabrika Admini",
      password: passwordHash,
      role: UserRole.ADMIN,
      tenantId: tenant.id,
      phone: "+905551112233",
    },
  });

  // 6. Süper Admin Kullanıcısı
  console.log("🛡️ Creating super admin user...");
  const superAdmin = await prisma.user.create({
    data: {
      email: "super@admin.com",
      name: "Sistem Süper Admin",
      password: passwordHash,
      role: UserRole.SUPER_ADMIN,
      tenantId: null, // Super admin tenant'a bağlı olmak zorunda değil
    },
  });

  console.log("✅ Seed data created successfully.\n");
  console.log("Giriş için kullanıcılar:");
  console.log("-----------------------------------------");
  console.log(`Fabrika Admini : ${adminUser.email} / ${plainPassword}`);
  console.log(`Süper Admin    : ${superAdmin.email} / ${plainPassword}`);
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
