"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/Toast";

type Cat = { id: string; slug: string; name: string; emoji: string; description: string; order: number; count: number };

export default function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Cat | "new" | null>(null);
  const [form, setForm] = useState({ name: "", emoji: "📜", description: "", order: 99 });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function open(c: Cat | "new") {
    setEditing(c);
    setErr("");
    if (c === "new") setForm({ name: "", emoji: "📜", description: "", order: 99 });
    else setForm({ name: c.name, emoji: c.emoji, description: c.description, order: c.order });
  }

  async function save() {
    if (!form.name.trim()) {
      setErr("Name is required.");
      return;
    }
    setBusy(true);
    const isNew = editing === "new";
    const res = await fetch(isNew ? "/api/admin/categories" : `/api/admin/categories/${(editing as Cat).id}`, {
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
    toast(isNew ? "Category created" : "Category updated");
    setEditing(null);
    router.refresh();
  }

  async function del(c: Cat) {
    if (!confirm(`Delete "${c.name}"? Its ${c.count} wisdom entries will also be removed.`)) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Category deleted");
      router.refresh();
    } else toast("Could not delete");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h3 style={{ color: "var(--parchment)" }}>Categories</h3>
        <button className="btn btn-gold btn-sm" onClick={() => open("new")}>＋ New Category</button>
      </div>

      {editing && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ color: "var(--parchment)", marginBottom: "1rem" }}>{editing === "new" ? "New category" : "Edit category"}</h4>
          {err && <div className="form-err">{err}</div>}
          <div className="grid grid-2">
            <div className="field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>Emoji</label><input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} /></div>
          </div>
          <div className="field"><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label>Order</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="btn btn-gold btn-sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      <table className="tbl">
        <thead>
          <tr><th></th><th>Name</th><th>Slug</th><th>Entries</th><th>Order</th><th></th></tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.emoji}</td>
              <td style={{ color: "var(--parchment)" }}>{c.name}</td>
              <td style={{ color: "var(--text-dim)" }}>{c.slug}</td>
              <td>{c.count}</td>
              <td>{c.order}</td>
              <td>
                <button className="icon-btn" onClick={() => open(c)}>Edit</button>{" "}
                <button className="icon-btn del" onClick={() => del(c)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
