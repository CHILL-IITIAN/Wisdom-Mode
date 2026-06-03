/**
 * Bulk-import wisdom (and optionally categories) from a JSON file.
 *
 *   npm run import:wisdom                       # uses content/wisdom-to-import.json
 *   npm run import:wisdom -- path/to/file.json  # custom file
 *
 * - Upserts by `slug` (safe to re-run; existing entries are updated, not duplicated).
 * - Every imported wisdom entry is published, so it appears in the library AND
 *   automatically shows the Read-Aloud (🎧) option (built into the wisdom page).
 * - Validates required fields and that the category exists before writing.
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

const file = process.argv[2] || "content/wisdom-to-import.json";
const fullPath = path.resolve(process.cwd(), file);

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

const REQUIRED = ["slug", "category", "title", "problem", "wisdom", "shift", "action"];
const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function main() {
  if (!fs.existsSync(fullPath)) fail(`File not found: ${fullPath}`);

  let data;
  try {
    data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (e) {
    fail(`Invalid JSON in ${file}: ${e.message}`);
  }

  console.log(`📖 Importing from ${file}\n`);

  // 1) Optional: create/update categories first
  const categories = Array.isArray(data.categories) ? data.categories : [];
  for (const c of categories) {
    if (!c.slug || !c.name) fail(`Category missing slug/name: ${JSON.stringify(c)}`);
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, emoji: c.emoji || "📜", description: c.description || "", order: c.order ?? 99 },
      create: { slug: c.slug, name: c.name, emoji: c.emoji || "📜", description: c.description || "", order: c.order ?? 99 },
    });
    console.log(`   ✓ category: ${c.slug}`);
  }

  // Build a lookup of valid category slugs -> id
  const catRows = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catBySlug = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

  const wisdom = Array.isArray(data.wisdom) ? data.wisdom : [];
  if (wisdom.length === 0) fail("No entries found under the 'wisdom' array.");

  // 2) Validate everything BEFORE writing (all-or-nothing on validation)
  const seen = new Set();
  wisdom.forEach((w, i) => {
    const where = `wisdom[${i}] (${w.slug || "no-slug"})`;
    for (const key of REQUIRED) {
      if (!w[key] || String(w[key]).trim() === "") fail(`${where}: missing required field "${key}"`);
    }
    if (!slugRe.test(w.slug)) fail(`${where}: slug must be lowercase-with-dashes (got "${w.slug}")`);
    if (seen.has(w.slug)) fail(`${where}: duplicate slug "${w.slug}" in the file`);
    seen.add(w.slug);
    if (!catBySlug[w.category]) {
      fail(`${where}: category "${w.category}" does not exist. Valid: ${Object.keys(catBySlug).join(", ")} (or add it under "categories")`);
    }
    if (w.questions && !Array.isArray(w.questions)) fail(`${where}: "questions" must be a list of strings`);
  });

  // 3) Write
  let created = 0, updated = 0;
  for (const w of wisdom) {
    const existing = await prisma.wisdomEntry.findUnique({ where: { slug: w.slug } });
    const payload = {
      title: w.title,
      problem: w.problem,
      wisdom: w.wisdom,
      shift: w.shift,
      action: w.action,
      questions: JSON.stringify(Array.isArray(w.questions) ? w.questions : []),
      tags: w.tags || "",
      related: w.related || "",
      status: "published",
      popular: !!w.popular,
      featured: !!w.featured,
      categoryId: catBySlug[w.category],
    };
    await prisma.wisdomEntry.upsert({
      where: { slug: w.slug },
      update: payload,
      create: { slug: w.slug, ...payload },
    });
    existing ? updated++ : created++;
    console.log(`   ✓ ${existing ? "updated" : "created"}: ${w.slug}`);
  }

  console.log(`\n✅ Done. ${created} created, ${updated} updated.`);
  console.log("   Each entry is published and includes the Read-Aloud (🎧) option automatically.\n");
}

main()
  .catch((e) => fail(e.message))
  .finally(async () => prisma.$disconnect());
