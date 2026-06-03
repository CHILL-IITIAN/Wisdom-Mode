"use client";

import { useRouter } from "next/navigation";
import { fmtDate } from "@/lib/utils";
import { toast } from "@/components/Toast";

type U = {
  id: string; name: string; email: string; role: string; status: string;
  joinDate: string; journalCount: number; favCount: number;
};

export default function UserManager({ users, currentUserId }: { users: U[]; currentUserId: string }) {
  const router = useRouter();

  async function toggle(u: U) {
    const action = u.status === "suspended" ? "activate" : "suspend";
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      toast(action === "suspend" ? "User suspended" : "User reactivated");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      toast(d.error || "Could not update");
    }
  }

  async function del(u: U) {
    if (!confirm(`Permanently delete ${u.name}? Their journal and favorites will be removed.`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("User deleted");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      toast(d.error || "Could not delete");
    }
  }

  return (
    <div>
      <h3 style={{ color: "var(--parchment)", marginBottom: "1.5rem" }}>Users ({users.length})</h3>
      <table className="tbl">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Journal</th><th>Favs</th><th></th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ color: "var(--parchment)" }}>{u.name}{u.id === currentUserId && " (you)"}</td>
              <td style={{ color: "var(--text-dim)" }}>{u.email}</td>
              <td>{u.role === "admin" ? <span className="badge admin">admin</span> : "user"}</td>
              <td>{u.status === "suspended" ? <span className="badge susp">suspended</span> : <span className="badge pub">active</span>}</td>
              <td style={{ color: "var(--text-dim)", whiteSpace: "nowrap" }}>{fmtDate(u.joinDate)}</td>
              <td>{u.journalCount}</td>
              <td>{u.favCount}</td>
              <td>
                {u.id !== currentUserId && (
                  <>
                    <button className="icon-btn" onClick={() => toggle(u)}>{u.status === "suspended" ? "Activate" : "Suspend"}</button>{" "}
                    <button className="icon-btn del" onClick={() => del(u)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
