import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <section className="section">
      <div className="wrap detail">
        <div className="sec-head" style={{ textAlign: "left" }}>
          <div className="kicker">The fine print</div>
          <h2>Terms of Service</h2>
        </div>
        <div className="wisdom-text">
          <p>
            Wisdom Mode offers reflective, educational content for personal growth. It is not a substitute for
            professional medical, psychological, or therapeutic advice. If you are in crisis, please reach out to a
            qualified professional or local emergency services.
          </p>
          <p>
            The wisdom content is provided for your personal reflection. Please do not redistribute or republish it
            without permission.
          </p>
          <p>By creating an account, you agree to use the platform respectfully and lawfully.</p>
        </div>
      </div>
    </section>
  );
}
