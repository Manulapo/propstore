'use client'

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserIcon } from "lucide-react";
import Link from "next/link";

const UserButton = () => {
    const { data: session, status } = useSession();
    const isLogged = status === "authenticated";

    if (!isLogged) {
        return (
            <Button asChild>
                <Link href="/sign-in">
                    <UserIcon /> Sign in
                </Link>
            </Button>
        )
    }

    const firstInitial = session?.user?.name?.charAt(0).toUpperCase() ?? 'U';

    return (<div className="flex gap-2 items-center">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="dlex items-center">
                    <Button variant="ghost" className="relative w-8 h-8 rouned-full ml-s flex items-center justify-center bg-gray-200">
                        {firstInitial}
                    </Button>
                </div>
            </DropdownMenuTrigger>
        </DropdownMenu>
    </div>)
}

export default UserButton;