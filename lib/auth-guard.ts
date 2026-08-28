import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { redirect } from "next/navigation";

export async function requireUserSession() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!currentUser) throw new Error("Not authenticated");

  // Refresh mutable authorization data instead of trusting a stale JWT role.
  session.user.role = currentUser.role;

  return session;
}

export async function requireAdminSession() {
  const session = await requireUserSession();

  if (session.user.role !== "admin") {
    throw new Error("Not authorized");
  }

  return session;
}

export async function requireAdmin() {
  try {
    return await requireAdminSession();
  } catch {
    const session = await auth();
    if (!session) {
      redirect("/sign-in");
    }
    redirect("/unauthorized");
  }
}
