import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { getAllCategories } from "@/lib/actions/product.actions";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

const CategoryDrawer = async () => {
  const categories = await getAllCategories();

  return (
    <div>
      <Drawer direction="left">
        <DrawerTrigger asChild>
          <Button variant="ghost">
            <MenuIcon />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-full max-w-sm">
          <DrawerHeader>
            <div className="mb-4">
              <DrawerTitle>Select a Category</DrawerTitle>
            </div>
            <div className="space-y-1">
              {categories.map(({ category, _count }) => (
                <Button
                  key={category}
                  variant="ghost"
                  className="w-full flex-start"
                  asChild
                >
                  <DrawerClose asChild>
                    <Link href={`/search?category=${category}`}>
                      {category} <Badge variant={'secondary'}>{_count.toString()}</Badge>
                    </Link>
                  </DrawerClose>
                </Button>
              ))}
            </div>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default CategoryDrawer;
