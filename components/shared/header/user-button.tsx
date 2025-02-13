import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserIcon } from "lucide-react";
import Link from "next/link";

const UserButton = () => {
    const { data: session } = useSession();

    if (!session) {
        return (
            <Button asChild>
                <Link href="/sign-in">
                    <UserIcon /> Sign in
                </Link>
            </Button>
        );
    }

    const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? 'U';

    return (
        <div className='flex gap-2 items-center'>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className='flex items-center'>
                        <Button
                            variant='ghost'
                            className='relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-200'
                        >
                            {firstInitial}
                        </Button>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='end' forceMount>
                    <DropdownMenuLabel className='font-normal'>
                        <div className='flex flex-col space-y-1'>
                            <div className='text-sm font-medium leading-none'>
                                {session.user?.name}
                            </div>
                            <div className='text-sm text-muted-foreground leading-none'>
                                {session.user?.email}
                            </div>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuItem className='p-0 mb-1'>
                        <Button
                            className='w-full py-4 px-2 h-4 justify-start text-destructive'
                            variant='ghost'
                            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
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