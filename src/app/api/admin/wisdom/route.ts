import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function guard() {
  const user = await getCurrentUser();
  return !!user && user.role === "admin";
}

const schema = z.object({
  title: z.string().min(2).max(160),
  categoryId: z.string().min(1),
  problem: z.string().min(2).max(400),
  wisdom: z.string().min(10),
  shift: z.string().min(2),
  action: z.string().min(2),
  questions: z.string().optional(), // newline-separated
  tags: z.string().optional(),
  related: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  popular: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  const d = parsed.data;
  let slug = slugify(d.title);
  // ensure unique slug
  let i = 1;
  while (await prisma.wisdomEntry.findUnique({ where: { slug } })) {
    slug = `${slugify(d.title)}-${i++}`;
  }
  const questions = JSON.stringify(
    (d.questions || "").split("\n").map((q) => q.trim()).filter(Boolean)
  );
  await prisma.wisdomEntry.create({
    data: {
      slug,
      title: d.title,
      categoryId: d.categoryId,
      problem: d.problem,
      wisdom: d.wisdom,
      shift: d.shift,
      action: d.action,
      questions,
      tags: d.tags || "",
      related: d.related || "",
      status: d.status || "draft",
      popular: !!d.popular,
      featured: !!d.featured,
    },
  });
  return NextResponse.json({ ok: true, slug });
}
