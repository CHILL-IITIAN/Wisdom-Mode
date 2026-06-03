import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function guard() {
  const user = await getCurrentUser();
  return !!user && user.role === "admin";
}

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  thought: z.string().min(2),
  author: z.string().optional(),
  question: z.string().min(2),
  challenge: z.string().min(2),
});

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  const exists = await prisma.reflection.findUnique({ where: { date: parsed.data.date } });
  if (exists) return NextResponse.json({ error: "A reflection for that date already exists." }, { status: 409 });
  await prisma.reflection.create({
    data: { ...parsed.data, author: parsed.data.author || "— The Archive" },
  });
  return NextResponse.json({ ok: true });
}
