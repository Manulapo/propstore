"use client";

import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ClientUserMenu from "./client-user-menu";

const UserButton = () => {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session || !session.user) {
    return (
      <Button asChild>
        <Link href="/sign-in">
          <UserIcon className="mr-2 h-4 w-4" />
          Sign in
        </Link>
      </Button>
    );
  }

  const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <ClientUserMenu
      name={session.user.name ?? undefined}
      email={session.user.email}
      role={session.user.role}
      firstInitial={firstInitial}
    />
  );
};

export default UserButton;
