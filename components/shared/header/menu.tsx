import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { EllipsisVertical, ShoppingCart } from "lucide-react";
import Link from "next/link";
import ThemeModeToggle from "./theme-mode-toggle";
import UserButton from "./user-button";

const Menu = () => {
    return <div className="flex justify-end gap-3">
        <nav className="hidden md:flex w-full max-w-xs gap-1">
            <ThemeModeToggle />
            <Button variant="ghost" asChild>
                <Link href="/cart">
                    <ShoppingCart /> Cart
                </Link>
            </Button>
            <UserButton />
        </nav>

        {/* Shown on medium and small screens, hidden on large */}
        <nav className="md:hidden flex w-full max-w-xs gap-1">
            <Sheet>
                <SheetTrigger className="align-middle">
                    <EllipsisVertical />
                </SheetTrigger>
                <SheetContent className="h-full flex flex-col">
                    <div className="flex gap-2 items-center">
                        <SheetTitle>Menu</SheetTitle>
                        <ThemeModeToggle />
                    </div>
                    <div className="flex gap-2 py-4">
                        <Button variant="ghost" className="grow" asChild>
                            <Link href="/cart">
                                <ShoppingCart className="mr-2" /> Cart
                            </Link>
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2 mt-auto">
                        <UserButton />
                        <SheetDescription>
                            {APP_NAME} {APP_DESCRIPTION}
                        </SheetDescription>
                    </div>
                </SheetContent>
            </Sheet>
        </nav>
    </div>;
}

export default Menu;