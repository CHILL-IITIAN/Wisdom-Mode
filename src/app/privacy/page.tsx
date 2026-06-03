import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="wrap detail">
        <div className="sec-head" style={{ textAlign: "left" }}>
          <div className="kicker">Your trust matters</div>
          <h2>Privacy Policy</h2>
        </div>
        <div className="wisdom-text">
          <p>
            Wisdom Mode stores only what is needed to give you a personal library: your name, email, a securely
            hashed password, and the content you create — journal entries and favorites.
          </p>
          <p>
            <strong>Your journal is private.</strong> Journal entries are visible only to you. They are never shared,
            sold, or used for advertising.
          </p>
          <p>
            Passwords are hashed with bcrypt and never stored in plain text. We do not track you across the web, and
            we do not run engagement-maximizing analytics.
          </p>
          <p>You may edit your profile or request deletion of your account at any time.</p>
        </div>
      </div>
    </section>
  );
}
