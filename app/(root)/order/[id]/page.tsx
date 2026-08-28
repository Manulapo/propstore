import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order-actions";
import { notFound } from "next/navigation";
import { ShippingAddress } from "@/types";
import OrderDetailTable from "./order-details-table";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import Stripe from "stripe";
import { CURRENCY_CODE } from "@/lib/constants";
import { PaymentResult } from "@/types";

export const metadata: Metadata = {
  title: "Order Detail",
};

// how to get the order id from the URL
// async (props: { params: Promise<{ id: string }> })

const OrderDetailPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  const order = await getOrderById(id);

  if (!order) return notFound();

  const session = await auth();
  let client_secret = null;

  // check if is not paid with stripe and is not already paid
  if (order.paymentMethod === "Stripe" && order.isPaid === false) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const existingPayment = order.paymentResult as PaymentResult | null;
    const paymentIntent = existingPayment?.id?.startsWith("pi_")
      ? await stripe.paymentIntents.retrieve(existingPayment.id)
      : await stripe.paymentIntents.create({
          amount: Math.round(Number(order.totalPrice) * 100),
          currency: CURRENCY_CODE.toLowerCase(),
          metadata: { orderId: order.id },
        });

    if (!existingPayment?.id?.startsWith("pi_")) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentResult: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            email_address: "",
            price_paid: order.totalPrice.toString(),
          },
        },
      });
    }

    // get the client secret from the payment intent
    client_secret = paymentIntent.client_secret;
  }

  return (
    <OrderDetailTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
        orderItems: order.orderitems,
        user: { name: order.user.name ?? "", email: order.user.email ?? "" },
      }}
      stripeClientSecret={client_secret ?? ""}
      isAdmin={session?.user?.role === "admin" || false}
    />
  );
};

export default OrderDetailPage;
