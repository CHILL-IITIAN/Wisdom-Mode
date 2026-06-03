import { prisma } from "./db";
import { getCurrentUser } from "./auth";

/** Set of favorite ids for the current user, keyed as `${type}:${id}`. */
export async function getFavoriteSet(): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) return new Set();
  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { itemType: true, itemId: true },
  });
  return new Set(favs.map((f) => `${f.itemType}:${f.itemId}`));
}

export async function getCategoriesWithCounts() {
  const cats = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { entries: { where: { status: "published" } } } } },
  });
  return cats;
}

/** Map of category slug -> sub-struggle tags inferred from entries (for chips). */
export async function getCategorySubs(): Promise<Record<string, string[]>> {
  const cats = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      entries: {
        where: { status: "published" },
        select: { title: true },
      },
    },
  });
  const map: Record<string, string[]> = {};
  for (const c of cats) map[c.slug] = c.entries.map((e) => e.title);
  return map;
}
