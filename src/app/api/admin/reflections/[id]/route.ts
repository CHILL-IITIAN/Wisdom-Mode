import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function guard() {
  const user = await getCurrentUser();
  return !!user && user.role === "admin";
}

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  thought: z.string().min(2),
  author: z.string().optional(),
  question: z.string().min(2),
  challenge: z.string().min(2),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await guard())) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  await prisma.reflection.update({
    where: { id: params.id },
    data: { ...parsed.data, author: parsed.data.author || "— The Archive" },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await guard())) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await prisma.reflection.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
