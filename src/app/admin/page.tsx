import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [users, cats, wisdom, drafts, reflections, journals, favs] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.wisdomEntry.count({ where: { status: "published" } }),
    prisma.wisdomEntry.count({ where: { status: "draft" } }),
    prisma.reflection.count(),
    prisma.journalEntry.count(),
    prisma.favorite.count(),
  ]);

  const stats = [
    { label: "Users", value: users, href: "/admin/users" },
    { label: "Categories", value: cats, href: "/admin/categories" },
    { label: "Published Wisdom", value: wisdom, href: "/admin/wisdom" },
    { label: "Drafts", value: drafts, href: "/admin/wisdom" },
    { label: "Reflections", value: reflections, href: "/admin/reflections" },
    { label: "Journal Entries", value: journals, href: "/admin" },
    { label: "Favorites", value: favs, href: "/admin" },
  ];

  return (
    <div className="grid grid-4">
      {stats.map((s) => (
        <Link key={s.label} href={s.href} className="card stat">
          <b>{s.value}</b>
          <span>{s.label}</span>
        </Link>
      ))}
    </div>
  );
}
