import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order-actions";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { payment_intent: string };
}) {
  const { id } = params;
  const { payment_intent: paymentIntentId } = searchParams;

  const order = await getOrderById(id);
  if (!order) notFound();

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (
    !paymentIntent ||
    !paymentIntent.metadata.orderId ||
    paymentIntent.metadata.orderId !== order.id.toString()
  ) {
    notFound();
  }

  const isPaymentIntentSucceeded = paymentIntent.status === "succeeded";
  if (!isPaymentIntentSucceeded) return redirect(`/order/${id}`);

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="h1-bold">Thanks for your Purchase</h1>
        <p>We are processing your order.</p>
        <Button asChild>
          <Link href={`/order/${id}`}>View Order</Link>
        </Button>
      </div>
    </div>
  );
}
