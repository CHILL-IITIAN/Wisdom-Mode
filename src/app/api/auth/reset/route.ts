import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const requestSchema = z.object({ email: z.string().email() });
const confirmSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

/**
 * POST /api/auth/reset
 *  - { email }            -> generate a reset token (returned in dev for demo; email in prod)
 *  - { token, password }  -> set new password
 */
export async function POST(req: Request) {
  const body = await req.json();

  // Confirm flow
  if (body.token && body.password) {
    const parsed = confirmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const user = await prisma.user.findFirst({
      where: { resetToken: parsed.data.token, resetExpiry: { gt: new Date() } },
    });
    if (!user) {
      return NextResponse.json({ error: "Reset link is invalid or expired." }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hashPassword(parsed.data.password),
        resetToken: null,
        resetExpiry: null,
      },
    });
    return NextResponse.json({ ok: true });
  }

  // Request flow
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  // Always return ok to avoid email enumeration.
  if (user) {
    const token = crypto.randomBytes(24).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetExpiry: new Date(Date.now() + 1000 * 60 * 60) },
    });
    // In production, email this link. For the demo we surface it in dev only.
    const devLink =
      process.env.NODE_ENV !== "production" ? `/reset?token=${token}` : undefined;
    return NextResponse.json({ ok: true, devLink });
  }
  return NextResponse.json({ ok: true });
}
