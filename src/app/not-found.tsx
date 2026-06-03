import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="empty" style={{ padding: "6rem 1rem" }}>
          <div className="e" aria-hidden>🕯️</div>
          <h2 style={{ color: "var(--parchment)" }}>This shelf is empty</h2>
          <p style={{ maxWidth: 380, margin: ".5rem auto 1.5rem" }}>
            The page you sought is not in the archive. Perhaps the library will hold what you need.
          </p>
          <Link className="btn btn-gold" href="/library">Return to the library</Link>
        </div>
      </div>
    </section>
  );
}
