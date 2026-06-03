import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const user = await getCurrentUser();
  if (user) redirect(searchParams.next || "/library");
  return (
    <section className="section">
      <div className="wrap auth-wrap">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="msub">Re-enter the library of wisdom.</p>
          <LoginForm next={searchParams.next} />
          <div className="switch">
            New here? <Link href="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
