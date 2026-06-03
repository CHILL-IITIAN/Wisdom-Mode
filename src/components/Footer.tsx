import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div style={{ maxWidth: 320 }}>
            <div className="brand" style={{ marginBottom: ".8rem" }}>
              <span className="lamp" aria-hidden>🪔</span>
              <span>Wisdom Mode</span>
            </div>
            <p style={{ color: "var(--text-dim)", fontSize: ".9rem", margin: 0 }}>
              A library of timeless wisdom for modern struggles. Hand-written, never AI-generated.
              Arrive confused, leave with clarity.
            </p>
          </div>
          <div className="foot-links">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
        <div className="foot-bottom">
          © {new Date().getFullYear()} Wisdom Mode · Built around one principle:{" "}
          <em>“The user arrived confused and left with greater clarity.”</em>
        </div>
      </div>
    </footer>
  );
}
