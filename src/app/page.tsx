import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteSet, getCategoriesWithCounts } from "@/lib/data";
import { wisdomParagraphs } from "@/lib/utils";
import WisdomCard from "@/components/WisdomCard";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: "📜", title: "Wisdom Library", desc: "A searchable archive of hand-written wisdom for real struggles.", href: "/library" },
  { icon: "🕯️", title: "Daily Reflection", desc: "One thought, one question, one challenge — each day.", href: "/daily" },
  { icon: "📔", title: "Personal Journal", desc: "A private space to reflect, write, and return to yourself.", href: "/journal" },
  { icon: "✦", title: "Favorites", desc: "Keep the wisdom that speaks to you close at hand.", href: "/favorites" },
];

export default async function HomePage() {
  const [user, favSet, cats, featured, counts] = await Promise.all([
    getCurrentUser(),
    getFavoriteSet(),
    getCategoriesWithCounts(),
    prisma.wisdomEntry.findMany({
      where: { status: "published", featured: true },
      include: { category: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.wisdomEntry.count({ where: { status: "published" } }),
  ]);
  const loggedIn = !!user;

  return (
    <>
      <section className="hero">
        <div className="glow" aria-hidden />
        <div className="wrap">
          <span className="eyebrow reveal">✦ The Premium Knowledge Vault</span>
          <h1 className="reveal d1">Wisdom Mode</h1>
          <p className="sub reveal d2">A library of timeless wisdom for modern struggles.</p>
          <div className="hero-btns reveal d3">
            <Link className="btn btn-gold" href={loggedIn ? "/library" : "/register"}>
              Enter Wisdom Mode →
            </Link>
            <Link className="btn btn-ghost" href="/categories">
              Explore Struggles
            </Link>
          </div>
          <div className="hero-stats reveal d4">
            <div className="s"><b>{counts}</b><span>Wisdom Entries</span></div>
            <div className="s"><b>{cats.length}</b><span>Categories</span></div>
            <div className="s"><b>100%</b><span>Human-Written</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div className="kicker">What awaits inside</div>
            <h2>A sanctuary, not a feed</h2>
            <p>No endless scrolling. No engagement traps. Only carefully written wisdom for the moments that matter.</p>
          </div>
          <div className="grid grid-4">
            {FEATURES.map((f, i) => (
              <Link key={f.title} href={f.href} className={`card feature reveal d${i + 1}`}>
                <div className="ic" aria-hidden>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "linear-gradient(180deg,transparent,rgba(0,0,0,.25),transparent)" }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="kicker">Find your struggle</div>
            <h2>Featured Categories</h2>
            <p>Every category holds wisdom written for a specific kind of difficulty.</p>
          </div>
          <div className="grid grid-2">
            {cats.map((c, i) => (
              <Link key={c.id} href={`/categories/${c.slug}`} className={`card cat-card reveal d${(i % 4) + 1}`}>
                <div className="top">
                  <span className="em" aria-hidden>{c.emoji}</span>
                  <span className="count">{c._count.entries} entries</span>
                </div>
                <h3>{c.name}</h3>
                <p style={{ color: "var(--text-dim)", fontSize: ".9rem", margin: 0 }}>{c.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div className="kicker">Featured Wisdom</div>
            <h2>Begin where it hurts</h2>
          </div>
          <div className="wlist">
            {featured.map((w, i) => (
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
        </div>
      </section>
    </>
  );
}
