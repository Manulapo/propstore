import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import Link from "next/link";
import ClientUserMenu from "./client-user-menu";

const UserButton = async () => {
  const session = await auth();

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
      name={session.user.name as string}
      email={session.user.email}
      role={session.user.role}
      firstInitial={firstInitial}
    />
  );

  
};

export default UserButton;
