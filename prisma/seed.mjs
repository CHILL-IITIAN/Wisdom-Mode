import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES, WISDOM, REFLECTIONS } from "./seed-data.mjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Wisdom Mode...");

  // --- Admin account ---
  const adminEmail = process.env.ADMIN_EMAIL || "admin@wisdommode.app";
  const adminPassword = process.env.ADMIN_PASSWORD || "WisdomAdmin#2026";
  const adminHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin", status: "active" },
    create: { name: "Head Librarian", email: adminEmail, password: adminHash, role: "admin" },
  });
  console.log(`   ✓ Admin: ${adminEmail} / ${adminPassword}`);

  // --- Demo user ---
  const demoHash = await bcrypt.hash("password123", 12);
  await prisma.user.upsert({
    where: { email: "seeker@wisdommode.app" },
    update: {},
    create: { name: "Seeker", email: "seeker@wisdommode.app", password: demoHash, role: "user" },
  });
  console.log("   ✓ Demo user: seeker@wisdommode.app / password123");

  // --- Categories ---
  const catMap = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, emoji: c.emoji, description: c.description, order: c.order },
      create: { slug: c.slug, name: c.name, emoji: c.emoji, description: c.description, order: c.order },
    });
    catMap[c.slug] = cat.id;
  }
  console.log(`   ✓ ${CATEGORIES.length} categories`);

  // --- Wisdom entries ---
  for (const w of WISDOM) {
    const categoryId = catMap[w.category];
    if (!categoryId) {
      console.warn(`   ! Missing category for ${w.slug}`);
      continue;
    }
    await prisma.wisdomEntry.upsert({
      where: { slug: w.slug },
      update: {
        title: w.title, problem: w.problem, wisdom: w.wisdom, shift: w.shift, action: w.action,
        questions: JSON.stringify(w.questions), tags: w.tags, related: w.related || "",
        popular: !!w.popular, featured: !!w.featured, status: "published", categoryId,
      },
      create: {
        slug: w.slug, title: w.title, problem: w.problem, wisdom: w.wisdom, shift: w.shift,
        action: w.action, questions: JSON.stringify(w.questions), tags: w.tags, related: w.related || "",
        popular: !!w.popular, featured: !!w.featured, status: "published", categoryId,
      },
    });
  }
  console.log(`   ✓ ${WISDOM.length} wisdom entries`);

  // --- Reflections ---
  for (const r of REFLECTIONS) {
    await prisma.reflection.upsert({
      where: { date: r.date },
      update: { thought: r.thought, author: r.author, question: r.question, challenge: r.challenge },
      create: r,
    });
  }
  console.log(`   ✓ ${REFLECTIONS.length} daily reflections`);

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
