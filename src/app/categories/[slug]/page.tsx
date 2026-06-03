import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteSet } from "@/lib/data";
import { wisdomParagraphs } from "@/lib/utils";
import WisdomCard from "@/components/WisdomCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!c) return { title: "Category" };
  return { title: c.name, description: c.description };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      entries: {
        where: { status: "published" },
        orderBy: [{ popular: "desc" }, { title: "asc" }],
      },
    },
  });
  if (!category) notFound();

  const [user, favSet] = await Promise.all([getCurrentUser(), getFavoriteSet()]);
  const loggedIn = !!user;

  return (
    <section className="section">
      <div className="wrap">
        <Link className="back" href="/categories">← All categories</Link>
        <div className="sec-head" style={{ textAlign: "left", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3rem" }} aria-hidden>{category.emoji}</div>
          <h2 style={{ margin: ".5rem 0" }}>{category.name}</h2>
          <p style={{ margin: 0 }}>{category.description}</p>
          <div className="chips" style={{ justifyContent: "flex-start", marginTop: "1rem" }}>
            {category.entries.map((e) => (
              <span className="chip" key={e.id}>{e.title}</span>
            ))}
          </div>
        </div>

        {category.entries.length ? (
          <div className="wlist">
            {category.entries.map((w, i) => (
              <WisdomCard
                key={w.id}
                w={{
                  slug: w.slug,
                  title: w.title,
                  problem: w.problem,
                  tag: w.title,
                  categoryName: category.name,
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
            <p>No wisdom in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
