import { prisma } from "@/lib/db";
import CategoryManager from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  const cats = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { entries: true } } },
  });
  return (
    <CategoryManager
      categories={cats.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        emoji: c.emoji,
        description: c.description,
        order: c.order,
        count: c._count.entries,
      }))}
    />
  );
}
