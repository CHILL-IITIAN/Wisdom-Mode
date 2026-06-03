"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/Toast";

type Entry = {
  id: string; slug: string; title: string; categoryId: string; categoryName: string;
  problem: string; wisdom: string; shift: string; action: string; questions: string;
  tags: string; related: string; status: string; popular: boolean; featured: boolean;
};
type Cat = { id: string; name: string };

const blank = (catId: string) => ({
  title: "", categoryId: catId, problem: "", wisdom: "", shift: "", action: "",
  questions: "", tags: "", related: "", status: "draft", popular: false, featured: false,
});

export default function WisdomManager({ entries, categories }: { entries: Entry[]; categories: Cat[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Entry | "new" | null>(null);
  const [form, setForm] = useState<any>(blank(categories[0]?.id || ""));
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function open(e: Entry | "new") {
    setEditing(e);
    setErr("");
    if (e === "new") setForm(blank(categories[0]?.id || ""));
    else setForm({ ...e });
  }

  async function save() {
    if (!form.title.trim() || !form.wisdom.trim()) {
      setErr("Title and wisdom message are required.");
      return;
    }
    setBusy(true);
    const isNew = editing === "new";
    const res = await fetch(isNew ? "/api/admin/wisdom" : `/api/admin/wisdom/${(editing as Entry).id}`, {
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
    toast(isNew ? "Wisdom created" : "Wisdom updated");
    setEditing(null);
    router.refresh();
  }

  async function del(e: Entry) {
    if (!confirm(`Delete "${e.title}"?`)) return;
    const res = await fetch(`/api/admin/wisdom/${e.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Wisdom deleted");
      router.refresh();
    } else toast("Could not delete");
  }

  if (editing) {
    const isNew = editing === "new";
    return (
      <div>
        <button className="back" onClick={() => setEditing(null)}>← Back to list</button>
        <h3 style={{ color: "var(--parchment)", marginBottom: "1rem" }}>{isNew ? "New wisdom entry" : "Edit wisdom"}</h3>
        {err && <div className="form-err">{err}</div>}
        <div className="grid grid-2">
          <div className="field"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field">
            <label>Category</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="field"><label>Problem statement</label><input value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} placeholder="I know what I should do, but…" /></div>
        <div className="field"><label>Wisdom message (separate paragraphs with a blank line)</label>
          <textarea rows={8} value={form.wisdom} onChange={(e) => setForm({ ...form, wisdom: e.target.value })} /></div>
        <div className="field"><label>Perspective shift</label><textarea rows={2} value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} /></div>
        <div className="field"><label>Practical action</label><textarea rows={2} value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} /></div>
        <div className="field"><label>Reflection questions (one per line)</label><textarea rows={3} value={form.questions} onChange={(e) => setForm({ ...form, questions: e.target.value })} /></div>
        <div className="grid grid-2">
          <div className="field"><label>Tags (comma-separated)</label><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
          <div className="field"><label>Related slugs (comma-separated)</label><input value={form.related} onChange={(e) => setForm({ ...form, related: e.target.value })} /></div>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", margin: "0 0 1.2rem", alignItems: "center" }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <label className="checkrow"><input type="checkbox" checked={form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} /> Popular</label>
          <label className="checkrow"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn-gold btn-sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h3 style={{ color: "var(--parchment)" }}>Wisdom Entries ({entries.length})</h3>
        <button className="btn btn-gold btn-sm" onClick={() => open("new")}>＋ New Entry</button>
      </div>
      <table className="tbl">
        <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Flags</th><th></th></tr></thead>
        <tbody>
          {entries.map((w) => (
            <tr key={w.id}>
              <td style={{ color: "var(--parchment)" }}>{w.title}</td>
              <td style={{ color: "var(--text-dim)" }}>{w.categoryName}</td>
              <td><span className={`badge ${w.status === "published" ? "pub" : "draft"}`}>{w.status}</span></td>
              <td style={{ color: "var(--gold)", fontSize: ".8rem" }}>{w.popular ? "★ " : ""}{w.featured ? "✦" : ""}</td>
              <td>
                <button className="icon-btn" onClick={() => open(w)}>Edit</button>{" "}
                <button className="icon-btn del" onClick={() => del(w)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
