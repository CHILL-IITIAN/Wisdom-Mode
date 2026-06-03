import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { wisdomParagraphs, fmtDate } from "@/lib/utils";
import WisdomCard from "@/components/WisdomCard";
import FavoriteButton from "@/components/FavoriteButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Favorites", description: "The wisdom and reflections you saved." };

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/favorites");

  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const wisdomSlugs = favs.filter((f) => f.itemType === "wisdom").map((f) => f.itemId);
  const reflectionIds = favs.filter((f) => f.itemType === "reflection").map((f) => f.itemId);

  const [favW, favR] = await Promise.all([
    wisdomSlugs.length
      ? prisma.wisdomEntry.findMany({
          where: { slug: { in: wisdomSlugs }, status: "published" },
          include: { category: true },
        })
      : Promise.resolve([]),
    reflectionIds.length
      ? prisma.reflection.findMany({ where: { id: { in: reflectionIds } } })
      : Promise.resolve([]),
  ]);

  const empty = favW.length === 0 && favR.length === 0;

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="kicker">Your collection</div>
          <h2>Favorites</h2>
          <p>The wisdom and reflections you chose to keep close.</p>
        </div>

        {empty && (
          <div className="empty">
            <div className="e" aria-hidden>✦</div>
            <h3 style={{ color: "var(--text-soft)" }}>No favorites yet</h3>
            <p>Tap the star on any wisdom entry to save it here.</p>
            <Link className="btn btn-gold" style={{ marginTop: "1rem" }} href="/library">Explore the library</Link>
          </div>
        )}

        {favW.length > 0 && (
          <>
            <h3 style={{ color: "var(--parchment)", marginBottom: "1.2rem" }}>📜 Saved Wisdom</h3>
            <div className="wlist" style={{ marginBottom: "2.5rem" }}>
              {favW.map((w, i) => (
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
                  isFav={true}
                  loggedIn={true}
                  delay={(i % 4) + 1}
                />
              ))}
            </div>
          </>
        )}

        {favR.length > 0 && (
          <>
            <h3 style={{ color: "var(--parchment)", marginBottom: "1.2rem" }}>🕯️ Saved Reflections</h3>
            <div className="grid grid-2">
              {favR.map((r) => (
                <div className="card" key={r.id}>
                  <div className="refl-date" style={{ textAlign: "left" }}>{fmtDate(r.date)}</div>
                  <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--text-soft)", margin: ".5rem 0 1rem" }}>
                    “{r.thought}”
                  </p>
                  <FavoriteButton itemType="reflection" itemId={r.id} initial={true} loggedIn={true} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
