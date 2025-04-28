import AppLogo from "@/components/shared/app-logo";
import Menu from "@/components/shared/header/menu";
import Link from "next/link";
import AdminSearch from "./admin-search";
import MainNav from "./main-nav";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex flex-col">
        <div className="border-b container mx-auto">
          <div className="flex items-center h-16 px-4">
            <Link href="/" className="w-22">
              <AppLogo />
            </Link>
            <MainNav className="mx-6" />
            <div className="ml-auto items-center flex space-x-4">
              <AdminSearch />
              <Menu />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 p-8 pt-6 container mx-auto">
          {children}
        </div>
      </div>
    </>
  );
}
