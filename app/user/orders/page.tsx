import { Metadata } from "next";
import { getMyOrders } from "@/lib/actions/order-actions";
import { formatDate, formatCurrency, formatId } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/shared/pagination";

export const metadata: Metadata = {
  title: "Orders",
  description: "Your orders",
};

const OrdersPage = async (props: {
  searchParams: Promise<{ page: string }>;
}) => {
  const { page } = await props.searchParams;
  const orders = await getMyOrders({
    page: Number(page) || 1,
  });

  return (
    <div className="space-y-2">
      <h2 className="h2-bold">Orders</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
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
                  <a
                    href={`/order/${order.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Details
                  </a>
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

export default OrdersPage;
