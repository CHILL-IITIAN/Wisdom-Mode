import { prisma } from "@/lib/db";
import ReflectionManager from "./ReflectionManager";

export const dynamic = "force-dynamic";

export default async function AdminReflections() {
  const reflections = await prisma.reflection.findMany({ orderBy: { date: "desc" } });
  return (
    <ReflectionManager
      reflections={reflections.map((r) => ({
        id: r.id, date: r.date, thought: r.thought, author: r.author,
        question: r.question, challenge: r.challenge,
      }))}
    />
  );
}
