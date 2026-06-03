import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import UserManager from "./UserManager";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const me = await getCurrentUser();
  const users = await prisma.user.findMany({
    orderBy: { joinDate: "desc" },
    include: { _count: { select: { journal: true, favorites: true } } },
  });
  return (
    <UserManager
      currentUserId={me!.id}
      users={users.map((u) => ({
        id: u.id, name: u.name, email: u.email, role: u.role, status: u.status,
        joinDate: u.joinDate.toISOString(), journalCount: u._count.journal, favCount: u._count.favorites,
      }))}
    />
  );
}
