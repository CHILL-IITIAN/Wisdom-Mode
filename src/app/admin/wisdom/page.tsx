import { prisma } from "@/lib/db";
import { parseQuestions } from "@/lib/utils";
import WisdomManager from "./WisdomManager";

export const dynamic = "force-dynamic";

export default async function AdminWisdom() {
  const [entries, cats] = await Promise.all([
    prisma.wisdomEntry.findMany({ orderBy: { updatedAt: "desc" }, include: { category: true } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <WisdomManager
      categories={cats.map((c) => ({ id: c.id, name: c.name }))}
      entries={entries.map((w) => ({
        id: w.id,
        slug: w.slug,
        title: w.title,
        categoryId: w.categoryId,
        categoryName: w.category.name,
        problem: w.problem,
        wisdom: w.wisdom,
        shift: w.shift,
        action: w.action,
        questions: parseQuestions(w.questions).join("\n"),
        tags: w.tags,
        related: w.related,
        status: w.status,
        popular: w.popular,
        featured: w.featured,
      }))}
    />
  );
}
