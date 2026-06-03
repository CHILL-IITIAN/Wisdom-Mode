"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "./Toast";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Wisdom Library" },
  { href: "/categories", label: "Categories" },
  { href: "/daily", label: "Daily Reflection" },
  { href: "/journal", label: "Journal" },
  { href: "/favorites", label: "Favorites" },
  { href: "/profile", label: "Profile" },
];

export default function Nav({ user }: { user: { name: string; role: string } | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast("Signed out. Until next time.");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link className="brand" href="/">
          <span className="lamp" aria-hidden>🪔</span>
          <span>
            Wisdom Mode<small>Knowledge Vault</small>
          </span>
        </Link>

        <nav className={`links${open ? " open" : ""}`} aria-label="Main navigation">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link href="/admin" className={pathname.startsWith("/admin") ? "active" : ""} onClick={() => setOpen(false)}>
              Admin
            </Link>
          )}
        </nav>

        <div className="nav-cta">
          {user ? (
            <>
              <button className="btn btn-ghost btn-sm" onClick={logout}>
                Sign Out
              </button>
              <Link href="/profile" className="avatar" aria-label="Your profile">
                {user.name.charAt(0).toUpperCase()}
              </Link>
            </>
          ) : (
            <Link href="/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
          )}
          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
