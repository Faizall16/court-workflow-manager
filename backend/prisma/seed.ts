import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Memulai seeding data staf...");

  await prisma.job.deleteMany({});
  await prisma.user.deleteMany({});

  await prisma.user.createMany({
    data: [
      {
        name: "Budi (Reporter Jakarta)",
        role: "REPORTER",
        location: "Jakarta",
        isAvailable: true,
      },
      {
        name: "Siti (Reporter Bandung)",
        role: "REPORTER",
        location: "Bandung",
        isAvailable: true,
      },
      {
        name: "Andi (Reporter Jakarta - Sibuk)",
        role: "REPORTER",
        location: "Jakarta",
        isAvailable: false,
      },
      {
        name: "Eko (Editor Senior)",
        role: "EDITOR",
        location: "Jakarta",
        isAvailable: true,
      },
      {
        name: "Rina (Editor Jurnal)",
        role: "EDITOR",
        location: "Surabaya",
        isAvailable: true,
      },
    ],
  });

  console.log("✅ Seeding sukses! Data staf telah ditambahkan ke database.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
