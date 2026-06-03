import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function guard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return false;
  return true;
}

const schema = z.object({
  name: z.string().min(2).max(80),
  emoji: z.string().max(8).optional(),
  description: z.string().max(400).optional(),
  order: z.coerce.number().int().optional(),
});

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  const slug = slugify(parsed.data.name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: "A category with that name exists." }, { status: 409 });
  await prisma.category.create({
    data: {
      slug,
      name: parsed.data.name,
      emoji: parsed.data.emoji || "📜",
      description: parsed.data.description || "",
      order: parsed.data.order ?? 99,
    },
  });
  return NextResponse.json({ ok: true });
}
