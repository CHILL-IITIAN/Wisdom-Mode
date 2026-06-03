import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import JournalManager from "./JournalManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Personal Journal",
  description: "A private space to reflect and write.",
};

export default async function JournalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/journal");

  const entries = await prisma.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <JournalManager
      entries={entries.map((e) => ({
        id: e.id,
        title: e.title,
        content: e.content,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }))}
    />
  );
}
