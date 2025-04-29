import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getMyCart } from "@/lib/actions/cart.actions";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { EllipsisVertical, ShoppingCart } from "lucide-react";
import Link from "next/link";
import ThemeModeToggle from "./theme-mode-toggle";
import UserButton from "./user-button";
import { auth } from "@/auth";

const Menu = async () => {
  const session = await auth();
  let cartItemCount = 0;
  if (session) {
    const cart = await getMyCart();
    cartItemCount =
      cart && cart.items.length > 0
        ? cart.items.reduce((acc, item) => acc + item.qty, 0)
        : 0;
  }

  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <ThemeModeToggle />
        <Button variant="ghost" asChild className="relative">
          <Link href="/cart">
            <ShoppingCart /> Cart{" "}
            {cartItemCount > 0 && (
              <span className="ml-1 rounded-full bg-main w-5 h-5 text-secondary justify-center flex text-xs items-center absolute top-0 right-0 border-none">
                {cartItemCount}
              </span>
            )}
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
    </div>
  );
};

export default Menu;
