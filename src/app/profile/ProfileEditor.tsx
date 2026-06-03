"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fmtDate } from "@/lib/utils";
import { toast } from "@/components/Toast";

export default function ProfileEditor({
  name,
  email,
  joinDate,
  isAdmin,
}: {
  name: string;
  email: string;
  joinDate: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [n, setN] = useState(name);
  const [e, setE] = useState(email);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: n.trim(), email: e.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || "Could not update.");
      return;
    }
    toast("Profile updated");
    setEditing(false);
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <div className="profile-head">
        <div className="big-av" aria-hidden>{name.charAt(0).toUpperCase()}</div>
        <div>
          <h2 style={{ margin: 0 }}>{name}</h2>
          <p style={{ color: "var(--text-dim)", margin: ".3rem 0 0" }}>{email}</p>
          <p style={{ color: "var(--gold)", fontSize: ".85rem", margin: ".3rem 0 0" }}>
            Member since {fmtDate(joinDate)} {isAdmin && "· Administrator"}
          </p>
        </div>
        {!editing && (
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setEditing(true)}>
            ✎ Edit Profile
          </button>
        )}
      </div>

      {editing && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ color: "var(--parchment)", marginBottom: "1rem" }}>Edit profile</h3>
          {err && <div className="form-err">{err}</div>}
          <div className="field">
            <label htmlFor="p-name">Name</label>
            <input id="p-name" value={n} onChange={(ev) => setN(ev.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="p-email">Email</label>
            <input id="p-email" type="email" value={e} onChange={(ev) => setE(ev.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="btn btn-gold" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ color: "var(--parchment)", marginBottom: "1rem" }}>Quick access</h3>
        <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap" }}>
          <Link className="btn btn-ghost btn-sm" href="/favorites">✦ My Favorites</Link>
          <Link className="btn btn-ghost btn-sm" href="/journal">📔 My Journal</Link>
          <Link className="btn btn-ghost btn-sm" href="/daily">🕯️ Daily Reflection</Link>
          {isAdmin && <Link className="btn btn-ghost btn-sm" href="/admin">⚙ Admin Panel</Link>}
          <button className="btn btn-ghost btn-sm" onClick={logout}>↪ Sign Out</button>
        </div>
      </div>
    </>
  );
}
