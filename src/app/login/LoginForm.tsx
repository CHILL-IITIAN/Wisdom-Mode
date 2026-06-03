"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, remember }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Login failed.");
      return;
    }
    router.push(next || (data.role === "admin" ? "/admin" : "/library"));
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      {err && <div className="form-err">{err}</div>}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <div className="row-between">
        <label className="checkrow">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
        </label>
        <Link href="/reset">Forgot password?</Link>
      </div>
      <button className="btn btn-gold" style={{ width: "100%" }} type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign In"}
      </button>
      <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: ".78rem", marginTop: "1rem" }}>
        Demo: seeker@wisdommode.app / password123
      </p>
    </form>
  );
}
