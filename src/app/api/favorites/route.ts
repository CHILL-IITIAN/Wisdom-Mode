import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  itemType: z.enum(["wisdom", "reflection"]),
  itemId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await prisma.favorite.upsert({
    where: {
      userId_itemType_itemId: {
        userId: user.id,
        itemType: parsed.data.itemType,
        itemId: parsed.data.itemId,
      },
    },
    update: {},
    create: { userId: user.id, ...parsed.data },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await prisma.favorite.deleteMany({
    where: { userId: user.id, itemType: parsed.data.itemType, itemId: parsed.data.itemId },
  });
  return NextResponse.json({ ok: true });
}
