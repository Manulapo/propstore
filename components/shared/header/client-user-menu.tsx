"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";

const ClientUserMenu = ({
  name,
  email,
  role,
  firstInitial,
}: {
  name: string | null | undefined;
  email: string | null | undefined;
  role: string | null | undefined;
  firstInitial: string | null | undefined;
} & React.HTMLProps<HTMLDivElement>) => {
  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-secondary"
            >
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="text-sm font-medium leading-none">{name}</div>
              <div className="text-sm text-muted-foreground leading-none">
                {email}
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

          {role === "admin" && (
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

export default ClientUserMenu;
