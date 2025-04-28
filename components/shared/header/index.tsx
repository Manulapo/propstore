import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import AppLogo from "../app-logo";
import CategoryDrawer from "./category-drawer";
import Menu from "./menu";
import Search from "./search";

export default async function AppHeader() {
  return (
    <header
      className={cn("w-full border-b fixed top-0 z-50 shadow-sm bg-background")}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CategoryDrawer />
          <Link href="/" className="flex items-center ml-4">
            <AppLogo />
          </Link>
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        </div>
        <div className="hidden md:block">
          <Search />
        </div>
        <Menu />
      </div>
    </header>
  );
}
