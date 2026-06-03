"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fmtDate } from "@/lib/utils";
import { toast } from "@/components/Toast";

type Entry = { id: string; title: string; content: string; createdAt: string; updatedAt: string };

export default function JournalManager({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Entry | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function open(e: Entry | "new") {
    setEditing(e);
    setErr("");
    if (e === "new") {
      setTitle("");
      setContent("");
    } else {
      setTitle(e.title);
      setContent(e.content);
    }
  }

  async function save() {
    if (!title.trim() || !content.trim()) {
      setErr("Title and content are required.");
      return;
    }
    setBusy(true);
    const isNew = editing === "new";
    const url = isNew ? "/api/journal" : `/api/journal/${(editing as Entry).id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || "Could not save.");
      return;
    }
    toast(isNew ? "Entry created" : "Entry updated");
    setEditing(null);
    router.refresh();
  }

  async function del(id: string) {
    if (!confirm("Delete this journal entry? This cannot be undone.")) return;
    const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Entry deleted");
      router.refresh();
    } else {
      toast("Could not delete");
    }
  }

  if (editing) {
    const isNew = editing === "new";
    return (
      <section className="section">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <button className="back" onClick={() => setEditing(null)}>← Back to journal</button>
          <h2 style={{ color: "var(--parchment)", marginBottom: "1.5rem" }}>
            {isNew ? "New journal entry" : "Edit entry"}
          </h2>
          {err && <div className="form-err">{err}</div>}
          <div className="field">
            <label htmlFor="j-title">Title</label>
            <input id="j-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give it a name" />
          </div>
          <div className="field">
            <label htmlFor="j-content">Content</label>
            <textarea id="j-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write freely…" rows={12} />
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button className="btn btn-gold" onClick={save} disabled={busy}>
              {busy ? "Saving…" : isNew ? "Create entry" : "Save changes"}
            </button>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="journal-head">
          <div>
            <div className="kicker" style={{ color: "var(--gold)", fontSize: ".72rem", letterSpacing: "3px", textTransform: "uppercase" }}>
              Private · only you can see this
            </div>
            <h2 style={{ margin: ".4rem 0 0" }}>Personal Journal</h2>
          </div>
          <button className="btn btn-gold" onClick={() => open("new")}>＋ New Entry</button>
        </div>

        {entries.length ? (
          <div className="grid grid-2">
            {entries.map((j) => (
              <div className="card jentry" key={j.id}>
                <div className="dt">
                  {fmtDate(j.createdAt)}
                  {j.updatedAt !== j.createdAt && <> · edited {fmtDate(j.updatedAt)}</>}
                </div>
                <h3>{j.title}</h3>
                <p>{j.content}</p>
                <div className="acts">
                  <button className="icon-btn" onClick={() => open(j)}>✎ Edit</button>
                  <button className="icon-btn del" onClick={() => del(j.id)}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="e" aria-hidden>📔</div>
            <h3 style={{ color: "var(--text-soft)" }}>Your journal is empty</h3>
            <p>Begin where you are. The first sentence is enough.</p>
          </div>
        )}
      </div>
    </section>
  );
}
