import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create Account" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/library");
  return (
    <section className="section">
      <div className="wrap auth-wrap">
        <div className="auth-card">
          <h1>Begin your journey</h1>
          <p className="msub">Create a free account to save wisdom and journal.</p>
          <RegisterForm />
          <div className="switch">
            Already a member? <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
