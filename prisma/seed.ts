import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();


async function main() {
  // Check if the User table exists (i.e., DB is migrated/initialized)
  try {
    await prisma.user.count();
  } catch (e) {
    console.error("❌ Database is not initialized. Run migrations first.");
    process.exit(1);
  }

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@splitwise.local" },
  });
  if (existingAdmin) {
    console.log("ℹ️  Admin user already exists. Skipping seed.");
    return;
  }

  // Create three users: ADMIN, USER, PRO
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);
  const proPassword = await bcrypt.hash("pro123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@splitwise.local",
      password: adminPassword,
    },
  });
  const user = await prisma.user.create({
    data: {
      name: "Normal User",
      email: "user@splitwise.local",
      password: userPassword,
    },
  });
  const pro = await prisma.user.create({
    data: {
      name: "Pro User",
      email: "pro@splitwise.local",
      password: proPassword,
    },
  });

  // Create a default group
  const group = await prisma.group.create({
    data: {
      name: "Default Group",
      description: "Seeded group",
    },
  });

  // Add users to group with different roles
  await prisma.groupMember.createMany({
    data: [
      { userId: admin.id, groupId: group.id, role: "ADMIN", status: "ACCEPTED" },
      { userId: user.id, groupId: group.id, role: "USER", status: "ACCEPTED" },
      { userId: pro.id, groupId: group.id, role: "PRO", status: "ACCEPTED" },
    ],
  });

  console.log("✅ Seed completed. Users:");
  console.log("Admin: admin@splitwise.local / admin123");
  console.log("User: user@splitwise.local / user123");
  console.log("Pro: pro@splitwise.local / pro123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });