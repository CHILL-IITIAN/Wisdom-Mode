"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Registration failed.");
      return;
    }
    router.push("/library");
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      {err && <div className="form-err">{err}</div>}
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
      </div>
      <button className="btn btn-gold" style={{ width: "100%" }} type="submit" disabled={busy}>
        {busy ? "Creating…" : "Create Account"}
      </button>
    </form>
  );
}
