"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader, UserIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

const UserButton = () => {
  const { data: session, status } = useSession(); //! get why the session takes a while to load and before it is unahuthenticated 

  if (status === "loading") {
    return (
      <Button variant="ghost" disabled>
        <UserIcon className="mr-2 h-4 w-4 animate-pulse" />
        <Loader className="animate-spin h-4 w-4" />
      </Button>
    );
  }

  if (status === "unauthenticated" || !session) {
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
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-200"
            >
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="text-sm font-medium leading-none">
                {session.user?.name}
              </div>
              <div className="text-sm text-muted-foreground leading-none">
                {session.user?.email}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuItem className="p-0 my-1">
            <Link href="/user/orders" className="w-full py-2 px-2">
              Order History
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 my-1">
            <Link href="/user/profile" className="w-full py-2 px-2">
              User Profile
            </Link>
          </DropdownMenuItem>

          {session.user?.role === "admin" && (
            <DropdownMenuItem className="p-0 my-1">
              <Link href="/admin/overview" className="w-full py-2 px-2">
                Admin Overview
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem className="p-0 my-1 border-t-2 border-r-0">
            <Button
              className="w-full py-4 px-2 h-2 justify-start text-destructive"
              variant="ghost"
              onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;
