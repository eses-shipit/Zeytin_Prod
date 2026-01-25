import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "super@admin.com" },
  });

  if (!user) {
    console.error("super@admin.com e-posta adresli kullanıcı bulunamadı.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash("123123", 10);

  await prisma.user.update({
    where: { email: "super@admin.com" },
    data: { password: hashedPassword },
  });

  console.log("Admin şifresi güncellendi");
}

main()
  .catch((e) => {
    console.error("Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
