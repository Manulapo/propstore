import Link from "next/link";
import { Button } from "./ui/button";

const ViewAllProducts = () => {
  return (
    <div className="flex items-center justify-center my-8">
      <Button asChild className="px-8 py-4 text-lg font-semibold">
        <Link href={"/search"}>View All</Link>
      </Button>
    </div>
  );
};

export default ViewAllProducts;
