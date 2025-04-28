import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getAllCategories } from "@/lib/actions/product.actions";
import { SearchIcon } from "lucide-react";

const Search = async () => {
  const categories = await getAllCategories();

  return (
    <form action={"/search"} method="GET">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Select name="category">
          <SelectTrigger className="w-[180px] border-none hover:bg-secondary">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key={"all"} value="all">
              All
            </SelectItem>
            {categories.map(({ category }) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          name="q"
          type="text"
          placeholder="Search..."
          className="md:w-[100px] lg:w-[300px] border-none bg-secondary"
        />
        <Button>
          <SearchIcon />
        </Button>
      </div>
    </form>
  );
};

export default Search;
