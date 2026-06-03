import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteSet } from "@/lib/data";
import { fmtDate, todayISO } from "@/lib/utils";
import FavoriteButton from "@/components/FavoriteButton";
import ListenButton from "@/components/ListenButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Daily Reflection",
  description: "One thought, one reflection question, and one gentle challenge each day.",
};

export default async function DailyPage() {
  const [user, favSet] = await Promise.all([getCurrentUser(), getFavoriteSet()]);
  const loggedIn = !!user;
  const today = todayISO();

  // Today's reflection, or the most recent available.
  const r =
    (await prisma.reflection.findUnique({ where: { date: today } })) ||
    (await prisma.reflection.findFirst({ orderBy: { date: "desc" } }));

  const past = await prisma.reflection.findMany({
    orderBy: { date: "desc" },
    take: 5,
    where: r ? { id: { not: r.id } } : undefined,
  });

  if (!r) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <div className="e" aria-hidden>🕯️</div>
            <p>No reflections have been written yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="reflection">
          <div className="refl-date">{fmtDate(r.date)} · Daily Reflection</div>
          <div className="sec-head" style={{ marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)" }}>A thought for today</h2>
          </div>
          <blockquote className="quote-big">
            “{r.thought}”<span className="author">{r.author}</span>
          </blockquote>
          <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
            <FavoriteButton
              itemType="reflection"
              itemId={r.id}
              initial={favSet.has(`reflection:${r.id}`)}
              loggedIn={loggedIn}
              variant="button"
            />
          </div>

          <ListenButton
            title="Listen to today's reflection"
            subtitle="Hear the Thought, Reflection Question & Daily Challenge read aloud."
            segments={[
              `Daily reflection. ${r.thought}`,
              `Reflection question. ${r.question}`,
              `Daily challenge. ${r.challenge}`,
            ]}
          />

          <div className="refl-cards">
            <div className="card">
              <div style={{ fontSize: ".74rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--gold)", marginBottom: ".8rem" }}>
                ❖ Reflection Question
              </div>
              <p style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "var(--parchment)", margin: 0 }}>{r.question}</p>
            </div>
            <div className="card">
              <div style={{ fontSize: ".74rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--ok)", marginBottom: ".8rem" }}>
                → Daily Challenge
              </div>
              <p style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "var(--parchment)", margin: 0 }}>{r.challenge}</p>
            </div>
          </div>

          {past.length > 0 && (
            <>
              <div className="sec-head" style={{ margin: "3rem 0 1.5rem" }}>
                <div className="kicker">From the past days</div>
              </div>
              <div className="grid grid-2">
                {past.map((rr) => (
                  <div className="card" key={rr.id}>
                    <div className="refl-date" style={{ textAlign: "left" }}>{fmtDate(rr.date)}</div>
                    <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--text-soft)", margin: ".5rem 0 0" }}>
                      “{rr.thought}”
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
