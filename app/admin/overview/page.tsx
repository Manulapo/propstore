import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrderSummary } from "@/lib/actions/order-actions";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { BadgeDollarSign, Barcode, CreditCardIcon, Users } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Overview Page",
};

const AdminOverViewPage = async () => {
  const session = await auth(); // to get if the user is an admin

  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const summary = await getOrderSummary();

  const {
    latestSales,
    ordersCount,
    productsCount,
    salesData,
    totalSales,
    usersCount,
  } = summary;

  return (
    <div className="space-y-2">
      <h1 className="h2-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-x-2">
            <CardTitle className="text-sm font-medium ">
              Total revenue
            </CardTitle>
            <BadgeDollarSign />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales._sum.totalPrice?.toString() || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-x-2">
            <CardTitle className="text-sm font-medium ">Sales</CardTitle>
            <CreditCardIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(ordersCount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-x-2">
            <CardTitle className="text-sm font-medium ">Users</CardTitle>
            <Users />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(usersCount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-x-2">
            <CardTitle className="text-sm font-medium ">Products</CardTitle>
            <Barcode />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(productsCount)}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-x-2">
            <CardTitle className="text-sm font-medium ">Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            {/* chart here */}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-x-2">
            <CardTitle className="text-sm font-medium ">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestSales.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order?.user?.name ?? "Deleted User"}</TableCell>
                    <TableCell>
                      {formatDate(order.createdAt).dateOnly}
                    </TableCell>
                    <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                    <TableCell>
                      <Link href={`/order/${order.id}`}>
                        <span className="px-2">Details</span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverViewPage;
