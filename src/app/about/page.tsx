import type { Metadata } from "next";
export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="section">
      <div className="wrap detail">
        <div className="sec-head" style={{ textAlign: "left" }}>
          <div className="kicker">Our purpose</div>
          <h2>About Wisdom Mode</h2>
        </div>
        <div className="wisdom-text">
          <p>
            Wisdom Mode is a premium digital wisdom library. Its purpose is to help you navigate emotional,
            psychological, personal and life-related struggles through carefully curated, pre-written wisdom.
          </p>
          <p>
            We do not generate wisdom with artificial intelligence. Every entry is hand-written, reviewed and
            maintained by our curators. We believe that wisdom for the soul deserves the care of a human mind.
          </p>
          <p>
            There are no infinite feeds here, no streaks to maintain, no notifications competing for your attention.
            A successful visit is not measured by time spent. It is measured by a single outcome:
            <em> you arrived confused, and left with greater clarity.</em>
          </p>
        </div>
      </div>
    </section>
  );
}
