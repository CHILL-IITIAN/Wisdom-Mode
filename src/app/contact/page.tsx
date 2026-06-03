import type { Metadata } from "next";
export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="section">
      <div className="wrap detail">
        <div className="sec-head" style={{ textAlign: "left" }}>
          <div className="kicker">Reach the librarians</div>
          <h2>Contact</h2>
        </div>
        <div className="wisdom-text">
          <p>We read every message with care.</p>
          <p>
            Email:{" "}
            <a href="mailto:hello@wisdommode.app" style={{ color: "var(--gold)" }}>
              hello@wisdommode.app
            </a>
          </p>
          <p>
            For content suggestions, corrections, or to share how a piece of wisdom helped you, we would be honored
            to hear from you.
          </p>
        </div>
      </div>
    </section>
  );
}
