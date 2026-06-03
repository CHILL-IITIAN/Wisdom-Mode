import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function guard() {
  const user = await getCurrentUser();
  return user && user.role === "admin" ? user : null;
}

const schema = z.object({ action: z.enum(["suspend", "activate"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await guard();
  if (!admin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (params.id === admin.id) {
    return NextResponse.json({ error: "You cannot modify your own account here." }, { status: 400 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await prisma.user.update({
    where: { id: params.id },
    data: { status: parsed.data.action === "suspend" ? "suspended" : "active" },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await guard();
  if (!admin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (params.id === admin.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
