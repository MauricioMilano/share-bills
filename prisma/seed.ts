import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@splitwise.local" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@splitwise.local",
      password: passwordHash,
    },
  });

  console.log("✅ Seed completed. Default user:");
  console.log("Email: admin@splitwise.local");
  console.log("Password: admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });