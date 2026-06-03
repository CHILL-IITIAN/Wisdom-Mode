import Link from "next/link";
import FavoriteButton from "./FavoriteButton";

export type WisdomCardData = {
  slug: string;
  title: string;
  problem: string;
  tag: string;
  categoryName: string;
  excerpt: string;
  popular: boolean;
};

export default function WisdomCard({
  w,
  isFav,
  loggedIn,
  delay = 1,
}: {
  w: WisdomCardData;
  isFav: boolean;
  loggedIn: boolean;
  delay?: number;
}) {
  return (
    <Link href={`/wisdom/${w.slug}`} className={`card wcard reveal d${delay}`}>
      <div className="meta">
        <span className="tag">
          {w.categoryName} · {w.tag}
        </span>
        <FavoriteButton itemType="wisdom" itemId={w.slug} initial={isFav} loggedIn={loggedIn} />
      </div>
      <h3>{w.title}</h3>
      <div className="prob">“{w.problem}”</div>
      <p style={{ color: "var(--text-dim)", fontSize: ".9rem", margin: "0 0 .5rem" }}>
        {w.excerpt.slice(0, 120)}…
      </p>
      <div className="foot">
        <span className="read">Read wisdom →</span>
        {w.popular && <span className="chip">★ Popular</span>}
      </div>
    </Link>
  );
}
