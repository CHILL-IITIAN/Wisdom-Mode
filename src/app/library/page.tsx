import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteSet, getCategoriesWithCounts } from "@/lib/data";
import { wisdomParagraphs } from "@/lib/utils";
import WisdomCard from "@/components/WisdomCard";
import SearchBar from "./SearchBar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Wisdom Library",
  description: "Search timeless wisdom by struggle, keyword, or feeling.",
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { q?: string; cat?: string };
}) {
  const q = (searchParams.q || "").trim();
  const cat = searchParams.cat || "all";

  const [user, favSet, cats] = await Promise.all([
    getCurrentUser(),
    getFavoriteSet(),
    getCategoriesWithCounts(),
  ]);
  const loggedIn = !!user;

  // Build query
  const where: any = { status: "published" };
  if (cat !== "all" && cat !== "popular" && cat !== "recent") {
    const c = cats.find((x) => x.slug === cat);
    if (c) where.categoryId = c.id;
  }
  if (cat === "popular") where.popular = true;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { problem: { contains: q } },
      { tags: { contains: q } },
      { wisdom: { contains: q } },
      { shift: { contains: q } },
    ];
  }

  let entries = await prisma.wisdomEntry.findMany({
    where,
    include: { category: true },
    orderBy: cat === "recent" ? { createdAt: "desc" } : [{ popular: "desc" }, { title: "asc" }],
    take: cat === "recent" ? 8 : 60,
  });

  const filterLink = (key: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (key !== "all") p.set("cat", key);
    return `/library${p.toString() ? "?" + p.toString() : ""}`;
  };

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="kicker">The Archive</div>
          <h2>Wisdom Library</h2>
          <p>Search a struggle by name, keyword, or feeling. Clarity is one query away.</p>
        </div>

        <SearchBar initial={q} cat={cat} />

        <div className="filters">
          <Link className={`fbtn${cat === "all" ? " active" : ""}`} href={filterLink("all")}>All</Link>
          {cats.map((c) => (
            <Link key={c.id} className={`fbtn${cat === c.slug ? " active" : ""}`} href={filterLink(c.slug)}>
              {c.emoji} {c.name}
            </Link>
          ))}
          <Link className={`fbtn${cat === "popular" ? " active" : ""}`} href={filterLink("popular")}>★ Popular</Link>
          <Link className={`fbtn${cat === "recent" ? " active" : ""}`} href={filterLink("recent")}>🕓 Recently Added</Link>
        </div>

        {entries.length ? (
          <div className="wlist">
            {entries.map((w, i) => (
              <WisdomCard
                key={w.id}
                w={{
                  slug: w.slug,
                  title: w.title,
                  problem: w.problem,
                  tag: w.title,
                  categoryName: w.category.name,
                  excerpt: wisdomParagraphs(w.wisdom)[0] || "",
                  popular: w.popular,
                }}
                isFav={favSet.has(`wisdom:${w.slug}`)}
                loggedIn={loggedIn}
                delay={(i % 4) + 1}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="e" aria-hidden>🕯️</div>
            <h3 style={{ color: "var(--text-soft)" }}>No wisdom found</h3>
            <p>Try another word for what you are feeling.</p>
          </div>
        )}
      </div>
    </section>
  );
}
