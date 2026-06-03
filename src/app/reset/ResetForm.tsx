"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetForm({ token }: { token?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [devLink, setDevLink] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Something went wrong.");
      return;
    }
    setMsg("If that email exists, a reset link is on its way.");
    if (data.devLink) setDevLink(data.devLink);
  }

  async function confirmReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Could not reset password.");
      return;
    }
    setMsg("Password updated. You can now sign in.");
    setTimeout(() => router.push("/login"), 1200);
  }

  if (token) {
    return (
      <form onSubmit={confirmReset}>
        {err && <div className="form-err">{err}</div>}
        {msg && <div className="form-ok">{msg}</div>}
        <div className="field">
          <label htmlFor="newpass">New password</label>
          <input id="newpass" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
        <button className="btn btn-gold" style={{ width: "100%" }} type="submit" disabled={busy}>
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={requestReset}>
      {err && <div className="form-err">{err}</div>}
      {msg && <div className="form-ok">{msg}</div>}
      {devLink && (
        <div className="form-ok">
          Dev link: <Link href={devLink} style={{ color: "var(--gold)" }}>{devLink}</Link>
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <button className="btn btn-gold" style={{ width: "100%" }} type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
