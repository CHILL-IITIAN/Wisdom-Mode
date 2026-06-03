import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://wisdommode.app";
  const staticRoutes = ["", "/library", "/categories", "/daily", "/about", "/contact", "/privacy", "/terms"].map(
    (p) => ({ url: `${base}${p}`, lastModified: new Date() })
  );

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [wisdom, cats] = await Promise.all([
      prisma.wisdomEntry.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ select: { slug: true } }),
    ]);
    dynamicRoutes = [
      ...wisdom.map((w) => ({ url: `${base}/wisdom/${w.slug}`, lastModified: w.updatedAt })),
      ...cats.map((c) => ({ url: `${base}/categories/${c.slug}`, lastModified: new Date() })),
    ];
  } catch {
    // DB may be unavailable at build time; static routes still emitted.
  }

  return [...staticRoutes, ...dynamicRoutes];
}
