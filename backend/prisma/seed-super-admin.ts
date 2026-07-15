import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🛡️  Super Admin seed starting...");

  // 1. Env kontrolü
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SUPER_ADMIN_EMAIL ve SUPER_ADMIN_PASSWORD ortam değişkenleri zorunludur.\n" +
        "Örnek: SUPER_ADMIN_EMAIL=admin@ornek.com SUPER_ADMIN_PASSWORD='...' npm run seed:super-admin",
    );
  }

  // 2. Sistemde tek bir Super Admin bulunabilir
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: UserRole.SUPER_ADMIN },
  });

  if (existingSuperAdmin) {
    throw new Error("Super Admin zaten mevcut. Yeni Super Admin oluşturulamaz.");
  }

  // 3. Email kontrolü
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Bu e-posta adresi zaten kayıtlı.");
  }

  // 4. Super Admin oluştur
  const passwordHash = await bcrypt.hash(password, 12);
  const superAdmin = await prisma.user.create({
    data: {
      email,
      name: process.env.SUPER_ADMIN_NAME || "Super Admin",
      password: passwordHash,
      role: UserRole.SUPER_ADMIN,
      tenantId: null, // Super admin tenant'a bağlı olmak zorunda değil
    },
  });

  console.log("✅ Super Admin created successfully.\n");
  console.log("-----------------------------------------");
  console.log(`Süper Admin : ${superAdmin.email}`);
  console.log("Şifre       : (ortam değişkeninden alındı, loglanmaz)");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(`❌ Super Admin seed error: ${e.message}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
