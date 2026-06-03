import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fmtDate } from "@/lib/utils";
import ProfileEditor from "./ProfileEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const [favCount, journalCount, entriesAvailable, catCount] = await Promise.all([
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.journalEntry.count({ where: { userId: user.id } }),
    prisma.wisdomEntry.count({ where: { status: "published" } }),
    prisma.category.count(),
  ]);

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <ProfileEditor
          name={user.name}
          email={user.email}
          joinDate={user.joinDate.toISOString()}
          isAdmin={user.role === "admin"}
        />
        <div className="grid stat-grid" style={{ margin: "2.5rem 0" }}>
          <div className="card stat"><b>{favCount}</b><span>Total Favorites</span></div>
          <div className="card stat"><b>{journalCount}</b><span>Journal Entries</span></div>
          <div className="card stat"><b>{entriesAvailable}</b><span>Entries Available</span></div>
          <div className="card stat"><b>{catCount}</b><span>Categories</span></div>
        </div>
        <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: ".85rem" }}>
          Member since {fmtDate(user.joinDate.toISOString())}
        </p>
      </div>
    </section>
  );
}
