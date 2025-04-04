import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order-actions";
import { notFound } from "next/navigation";
import { ShippingAddress } from "@/types";
import OrderDetailTable from "./order-details-table";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Order Detail",
};

// how to get the order id from the URL
// async (props: { params: Promise<{ id: string }> })

const OrderdetailPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  const order = await getOrderById(id);

  if (!order) return notFound();

  const session = await auth();  

  return (
    <OrderDetailTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
        orderItems: order.orderitems,
        user: { name: order.user.name ?? "", email: order.user.email ?? "" },
      }}
      paypalClientId={process.env.PAYPAL_CLIENT_ID ?? "sb"}
      isAdmin={session?.user?.role === 'admin' || false}
    />
  );
};

export default OrderdetailPage;
