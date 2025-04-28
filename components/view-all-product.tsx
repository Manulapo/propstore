import Link from "next/link";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";

const ViewAllProducts = () => {
  return (
    <div className="flex items-center justify-center my-8">
      <Button asChild className="px-8 py-4 text-lg font-semibold">
        <Link href={"/search"}>
        <ChevronDown className="mr-2" />
        View More</Link>
      </Button>
    </div>
  );
};

export default ViewAllProducts;
