import { requireAdmin } from "@/lib/auth-guard";
import { getAllProducts } from "@/lib/actions/product.actions";
import { formatCurrency, formatId } from "@/lib/utils";

const AdminProductPage = async (props: {
  searchParams: Promise<{ page: string; query: string; category: string }>;
}) => {
  await requireAdmin(); // Ensure the user is an admin
  const searchParams = await props.searchParams; // Await the searchParams promise if needed
  const page = Number(searchParams.page) || 1; // Default to page 1 if not provided
  const searchText = searchParams.query || ""; // Default to empty string if not provided
  const category = searchParams.category || ""; // Default to empty string if not provided

  const product = await getAllProducts({
    query: searchText,
    page,
    category,
  });

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <h1 className="h2-bold">Products</h1>
      </div>
    </div>
  );
};

export default AdminProductPage;
