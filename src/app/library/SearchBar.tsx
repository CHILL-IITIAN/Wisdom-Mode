"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ initial, cat }: { initial: string; cat: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (cat && cat !== "all") p.set("cat", cat);
    router.push(`/library${p.toString() ? "?" + p.toString() : ""}`);
  }

  return (
    <form className="toolbar" onSubmit={submit}>
      <label className="search" htmlFor="lib-search">
        <span style={{ color: "var(--gold)" }} aria-hidden>🔍</span>
        <input
          id="lib-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search: procrastination, loneliness, fear of failure…"
          aria-label="Search wisdom"
        />
      </label>
      <button className="btn btn-gold" type="submit">Search</button>
    </form>
  );
}
