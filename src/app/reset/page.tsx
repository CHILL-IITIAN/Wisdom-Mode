import type { Metadata } from "next";
import Link from "next/link";
import ResetForm from "./ResetForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reset Password" };

export default function ResetPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;
  return (
    <section className="section">
      <div className="wrap auth-wrap">
        <div className="auth-card">
          <h1>{token ? "Set a new password" : "Reset password"}</h1>
          <p className="msub">
            {token ? "Choose a new password for your account." : "We'll send a reset link to your email."}
          </p>
          <ResetForm token={token} />
          <div className="switch">
            <Link href="/login">← Back to sign in</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
