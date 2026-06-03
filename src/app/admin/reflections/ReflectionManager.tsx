"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fmtDate, todayISO } from "@/lib/utils";
import { toast } from "@/components/Toast";

type Refl = { id: string; date: string; thought: string; author: string; question: string; challenge: string };

const blank = () => ({ date: todayISO(), thought: "", author: "— The Archive", question: "", challenge: "" });

export default function ReflectionManager({ reflections }: { reflections: Refl[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Refl | "new" | null>(null);
  const [form, setForm] = useState<any>(blank());
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function open(r: Refl | "new") {
    setEditing(r);
    setErr("");
    setForm(r === "new" ? blank() : { ...r });
  }

  async function save() {
    if (!form.date || !form.thought.trim() || !form.question.trim() || !form.challenge.trim()) {
      setErr("Date, thought, question, and challenge are required.");
      return;
    }
    setBusy(true);
    const isNew = editing === "new";
    const res = await fetch(isNew ? "/api/admin/reflections" : `/api/admin/reflections/${(editing as Refl).id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || "Could not save.");
      return;
    }
    toast(isNew ? "Reflection created" : "Reflection updated");
    setEditing(null);
    router.refresh();
  }

  async function del(r: Refl) {
    if (!confirm(`Delete the reflection for ${fmtDate(r.date)}?`)) return;
    const res = await fetch(`/api/admin/reflections/${r.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Reflection deleted");
      router.refresh();
    } else toast("Could not delete");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h3 style={{ color: "var(--parchment)" }}>Daily Reflections</h3>
        <button className="btn btn-gold btn-sm" onClick={() => open("new")}>＋ New Reflection</button>
      </div>

      {editing && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ color: "var(--parchment)", marginBottom: "1rem" }}>{editing === "new" ? "New reflection" : "Edit reflection"}</h4>
          {err && <div className="form-err">{err}</div>}
          <div className="grid grid-2">
            <div className="field"><label>Date (YYYY-MM-DD)</label><input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="2026-06-02" /></div>
            <div className="field"><label>Author</label><input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
          </div>
          <div className="field"><label>Daily thought</label><textarea rows={3} value={form.thought} onChange={(e) => setForm({ ...form, thought: e.target.value })} /></div>
          <div className="field"><label>Reflection question</label><textarea rows={2} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
          <div className="field"><label>Daily challenge</label><textarea rows={2} value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} /></div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="btn btn-gold btn-sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      <table className="tbl">
        <thead><tr><th>Date</th><th>Thought</th><th></th></tr></thead>
        <tbody>
          {reflections.map((r) => (
            <tr key={r.id}>
              <td style={{ color: "var(--gold)", whiteSpace: "nowrap" }}>{fmtDate(r.date)}</td>
              <td style={{ color: "var(--text-soft)", maxWidth: 480, whiteSpace: "normal" }}>{r.thought.slice(0, 120)}…</td>
              <td>
                <button className="icon-btn" onClick={() => open(r)}>Edit</button>{" "}
                <button className="icon-btn del" onClick={() => del(r)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
