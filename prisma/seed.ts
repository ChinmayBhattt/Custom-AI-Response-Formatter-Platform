import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const BUILT_IN_FORMATS = [
  {
    name: "Arrow",
    pattern: "{prefix}→ {point}",
    prefix: "",
    description: "Each point prefixed with an arrow →",
  },
  {
    name: "Star",
    pattern: "{prefix}* {point}",
    prefix: "",
    description: "Each point prefixed with a star *",
  },
  {
    name: "Bullet",
    pattern: "{prefix}• {point}",
    prefix: "",
    description: "Each point prefixed with a bullet •",
  },
  {
    name: "Numbered",
    pattern: "{prefix}{index}. {point}",
    prefix: "",
    description: "Numbered list: 1. 2. 3.",
  },
  {
    name: "Paragraph",
    pattern: "{text}",
    prefix: "",
    description: "Normal flowing paragraphs",
  },
  {
    name: "One-line",
    pattern: "{text}",
    prefix: "",
    description: "Single concise answer in one line",
  },
];

async function main() {
  console.log("Seeding built-in formats...");

  for (const format of BUILT_IN_FORMATS) {
    await prisma.format.upsert({
      where: { id: format.name.toLowerCase() },
      update: {},
      create: {
        id: format.name.toLowerCase(),
        name: format.name,
        pattern: format.pattern,
        prefix: format.prefix,
        description: format.description,
        isBuiltIn: true,
        userId: null,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
