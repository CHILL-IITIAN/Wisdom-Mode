/**
 * Bulk-import wisdom from a CSV file (e.g. exported from a spreadsheet).
 *
 *   npm run import:wisdom:csv                      # uses content/wisdom-to-import.csv
 *   npm run import:wisdom:csv -- path/to/file.csv  # custom file
 *
 * CSV columns (header row required, any order):
 *   slug, category, title, problem, wisdom, shift, action, questions, tags, related, popular, featured
 *
 * Conventions:
 *   - Standard CSV quoting: wrap a field in "double quotes" if it contains commas,
 *     newlines, or quotes; escape a literal quote by doubling it ("").
 *   - wisdom paragraphs: separate with a blank line. In a spreadsheet cell use a
 *     real line break (Alt+Enter); OR write the literal characters \n\n and they
 *     will be converted to paragraph breaks.
 *   - questions: separate multiple questions with " | " (pipe) or newlines.
 *   - popular/featured: true/false, yes/no, 1/0 (blank = false).
 *
 * - Upserts by `slug` (safe to re-run; updates instead of duplicating).
 * - Every imported entry is published, so it shows in the library AND
 *   automatically includes the Read-Aloud (🎧) option.
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const file = process.argv[2] || "content/wisdom-to-import.csv";
const fullPath = path.resolve(process.cwd(), file);

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

/** Minimal but correct RFC-4180-ish CSV parser (handles quotes, commas, newlines). */
function parseCSV(text) {
  // Normalise line endings, strip a UTF-8 BOM if present.
  text = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } // escaped quote
        else inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  // last field/row (ignore a trailing empty line)
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function toBool(v) {
  return /^(true|yes|y|1)$/i.test(String(v || "").trim());
}

const REQUIRED = ["slug", "category", "title", "problem", "wisdom", "shift", "action"];
const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function main() {
  if (!fs.existsSync(fullPath)) fail(`File not found: ${fullPath}`);
  const rows = parseCSV(fs.readFileSync(fullPath, "utf8")).filter(
    (r) => r.length && !(r.length === 1 && r[0].trim() === "")
  );
  if (rows.length < 2) fail("CSV needs a header row plus at least one data row.");

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name) => header.indexOf(name);
  for (const col of REQUIRED) {
    if (idx(col) === -1) fail(`CSV is missing required column: "${col}". Found: ${header.join(", ")}`);
  }

  console.log(`📖 Importing from ${file}\n`);

  const catRows = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catBySlug = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

  // Parse rows into entries
  const entries = [];
  const seen = new Set();
  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    const get = (name) => (idx(name) > -1 ? (cols[idx(name)] ?? "").trim() : "");
    const where = `row ${r + 1} (${get("slug") || "no-slug"})`;

    const e = {
      slug: get("slug"),
      category: get("category"),
      title: get("title"),
      problem: get("problem"),
      // allow literal "\n" typed in a cell to become real newlines
      wisdom: get("wisdom").replace(/\\n/g, "\n"),
      shift: get("shift"),
      action: get("action"),
      questions: get("questions")
        .split(/\s*\|\s*|\n/)
        .map((q) => q.trim())
        .filter(Boolean),
      tags: get("tags"),
      related: get("related"),
      popular: toBool(get("popular")),
      featured: toBool(get("featured")),
    };

    for (const key of REQUIRED) {
      if (!e[key] || String(e[key]).trim() === "") fail(`${where}: missing required field "${key}"`);
    }
    if (!slugRe.test(e.slug)) fail(`${where}: slug must be lowercase-with-dashes (got "${e.slug}")`);
    if (seen.has(e.slug)) fail(`${where}: duplicate slug "${e.slug}" in the file`);
    seen.add(e.slug);
    if (!catBySlug[e.category]) {
      fail(`${where}: category "${e.category}" does not exist. Valid: ${Object.keys(catBySlug).join(", ")}`);
    }
    entries.push(e);
  }

  let created = 0, updated = 0;
  for (const e of entries) {
    const existing = await prisma.wisdomEntry.findUnique({ where: { slug: e.slug } });
    const payload = {
      title: e.title, problem: e.problem, wisdom: e.wisdom, shift: e.shift, action: e.action,
      questions: JSON.stringify(e.questions), tags: e.tags, related: e.related,
      status: "published", popular: e.popular, featured: e.featured, categoryId: catBySlug[e.category],
    };
    await prisma.wisdomEntry.upsert({ where: { slug: e.slug }, update: payload, create: { slug: e.slug, ...payload } });
    existing ? updated++ : created++;
    console.log(`   ✓ ${existing ? "updated" : "created"}: ${e.slug}`);
  }

  console.log(`\n✅ Done. ${created} created, ${updated} updated.`);
  console.log("   Each entry is published and includes the Read-Aloud (🎧) option automatically.\n");
}

main()
  .catch((e) => fail(e.message))
  .finally(async () => prisma.$disconnect());
