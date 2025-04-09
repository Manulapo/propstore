import { auth } from "@/auth";
import DeleteDialog from "@/components/shared/deleteDialog";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from "@/components/ui/table";
import { deleteOrder, getAllOrders } from "@/lib/actions/order-actions";
import { requireAdmin } from "@/lib/auth-guard";
import { formatCurrency, formatDate, formatId } from "@/lib/utils";
import {} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Orders",
};

const AdminOrderPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  await requireAdmin(); // Ensure the user is an admin

  const { page = "1", query: searchText } = await props.searchParams; // Get the page from search params and renamed query to searchText
  const session = await auth(); // Get the session

  if (!session || !session.user || session?.user?.role !== "admin") {
    throw new Error("Unauthorized"); // Throw an error if not an admin
  }

  const orders = await getAllOrders({
    page: Number(page), // Convert page to number
    query: searchText, // No query for orders
  });

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <h1 className="h2-bold">Orders</h1>
          {searchText && (
            <div>
              Filtered by <i>&quot;{searchText}&quot;</i>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm" className="ml-5">
                  Clear Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {formatId(order.id)}
                </TableCell>
                <TableCell>{formatDate(order.createdAt).dateTime}</TableCell>
                <TableCell>{order.user.name}</TableCell>

                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  <Badge variant={"secondary"}>
                    {order.isPaid && order.paidAt
                      ? formatDate(order.paidAt).dateTime
                      : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={"secondary"}>
                    {order.isDelivered && order.deliveredAt
                      ? formatDate(order.deliveredAt).dateTime
                      : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button asChild variant={"outline"} size={"sm"}>
                    <Link href={`/order/${order.id}`}>Details</Link>
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end mt-4">
          {orders.totalPages > 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={orders?.totalPages}
            ></Pagination>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderPage;
