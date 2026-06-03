import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteSet } from "@/lib/data";
import { parseQuestions, wisdomParagraphs, csvToList } from "@/lib/utils";
import FavoriteButton from "@/components/FavoriteButton";
import ListenButton from "@/components/ListenButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const w = await prisma.wisdomEntry.findUnique({ where: { slug: params.slug } });
  if (!w) return { title: "Wisdom" };
  return {
    title: w.title,
    description: w.problem,
    openGraph: { title: w.title, description: w.problem },
  };
}

export default async function WisdomPage({ params }: { params: { slug: string } }) {
  const w = await prisma.wisdomEntry.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });
  if (!w || w.status !== "published") notFound();

  const [user, favSet] = await Promise.all([getCurrentUser(), getFavoriteSet()]);
  const loggedIn = !!user;

  const relatedSlugs = csvToList(w.related);
  const related = relatedSlugs.length
    ? await prisma.wisdomEntry.findMany({
        where: { slug: { in: relatedSlugs }, status: "published" },
        select: { slug: true, title: true, category: { select: { name: true } } },
      })
    : [];

  const paragraphs = wisdomParagraphs(w.wisdom);
  const questions = parseQuestions(w.questions);

  return (
    <section className="section">
      <div className="wrap">
        <div className="detail">
          <Link className="back" href="/library">← Back to library</Link>
          <span className="tag">{w.category.name} · {w.title}</span>
          <h1>{w.title}</h1>
          <div className="problem-box">“{w.problem}”</div>

          <ListenButton
            segments={[
              `${w.title}. ${w.problem}`,
              ...paragraphs,
              `Perspective shift. ${w.shift}`,
              `Practical action. ${w.action}`,
            ]}
          />

          <div className="block">
            <div className="label">📜 The Wisdom <span className="ln" /></div>
            <div className="wisdom-text">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="block">
            <div className="label">✦ Perspective Shift <span className="ln" /></div>
            <div className="shift-box"><p>{w.shift}</p></div>
          </div>

          <div className="block">
            <div className="label">→ Practical Action <span className="ln" /></div>
            <div className="action-box">
              <div className="num">1</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "var(--text)" }}>{w.action}</div>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="block">
              <div className="label">❖ Reflection Questions <span className="ln" /></div>
              <ul className="qlist">
                {questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {related.length > 0 && (
            <div className="block">
              <div className="label">⚯ Related Struggles <span className="ln" /></div>
              <div className="related">
                {related.map((r) => (
                  <Link key={r.slug} href={`/wisdom/${r.slug}`} className="rel-card">
                    <div className="t">{r.title}</div>
                    <div className="c">{r.category.name}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="detail-actions">
            <FavoriteButton
              itemType="wisdom"
              itemId={w.slug}
              initial={favSet.has(`wisdom:${w.slug}`)}
              loggedIn={loggedIn}
              variant="button"
            />
            <Link className="btn btn-ghost" href="/library">Explore more wisdom</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
