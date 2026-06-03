import Link from "next/link";
import type { Metadata } from "next";
import { getCategoriesWithCounts, getCategorySubs } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Categories",
  description: "Explore wisdom by category: Studies & Work, Self Growth, Relationships, and Life Challenges.",
};

export default async function CategoriesPage() {
  const [cats, subs] = await Promise.all([getCategoriesWithCounts(), getCategorySubs()]);
  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="kicker">The Wings of the Library</div>
          <h2>Categories</h2>
          <p>Four halls, each devoted to a different family of human struggle.</p>
        </div>
        <div className="grid grid-2">
          {cats.map((c, i) => {
            const list = subs[c.slug] || [];
            return (
              <Link key={c.id} href={`/categories/${c.slug}`} className={`card cat-card reveal d${(i % 4) + 1}`}>
                <div className="top">
                  <span className="em" aria-hidden>{c.emoji}</span>
                  <span className="count">{c._count.entries} entries</span>
                </div>
                <h3>{c.name}</h3>
                <p style={{ color: "var(--text-dim)", fontSize: ".9rem", margin: 0 }}>{c.description}</p>
                <div className="chips">
                  {list.slice(0, 4).map((s) => (
                    <span className="chip" key={s}>{s}</span>
                  ))}
                  {list.length > 4 && <span className="chip">+{list.length - 4}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
