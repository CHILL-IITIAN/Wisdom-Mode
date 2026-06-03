import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function guard() {
  const user = await getCurrentUser();
  return !!user && user.role === "admin";
}

const schema = z.object({
  name: z.string().min(2).max(80),
  emoji: z.string().max(8).optional(),
  description: z.string().max(400).optional(),
  order: z.coerce.number().int().optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await guard())) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  await prisma.category.update({
    where: { id: params.id },
    data: {
      name: parsed.data.name,
      emoji: parsed.data.emoji || "📜",
      description: parsed.data.description || "",
      order: parsed.data.order ?? 99,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await guard())) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
