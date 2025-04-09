"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const AdminSearch = () => {
  const pathName = usePathname();

  const formActionUrl = pathName.includes("/admin/orders")
    ? "/admin/orders"
    : pathName.includes("/admin/users")
    ? "/admin/users"
    : "/admin/products";

  const searchParams = useSearchParams();
  const [queryValue, setQueryValue] = useState(searchParams.get("query") || "");

  useEffect(() => {
    setQueryValue(searchParams.get("query") || "");
  }, [searchParams]); // searchparams is an external variable put inside useEffect, so i need to put it in the dependency array since i did not created it inside the useEffect

  return (
    <form
      action={formActionUrl}
      method="GET"
      className="flex items-center space-x-2"
    >
      <Input
        type="search"
        name="query"
        placeholder="Search..."
        value={queryValue}
        onChange={(e) => setQueryValue(e.target.value)}
        className="md:w-[100px] lg:w-[300px]"
      />
      <Button type="submit" variant="outline" className="sr-only">Search</Button> {/* The button is hidden but still accessible for screen readers. This is a common practice for accessibility. */}
    </form>
  );
};

export default AdminSearch;
