import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
          <div className="kicker">Secure area · {user.name}</div>
          <h2>Admin Panel</h2>
          <p style={{ margin: 0 }}>Manage categories, wisdom, reflections, and users.</p>
        </div>
        <nav className="admin-tabs" aria-label="Admin sections">
          <Link href="/admin">Overview</Link>
          <Link href="/admin/categories">Categories</Link>
          <Link href="/admin/wisdom">Wisdom</Link>
          <Link href="/admin/reflections">Reflections</Link>
          <Link href="/admin/users">Users</Link>
        </nav>
        {children}
      </div>
    </section>
  );
}
