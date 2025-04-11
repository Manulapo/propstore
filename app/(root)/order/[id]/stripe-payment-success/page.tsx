import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order-actions";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const SuccessPage = async (props: {
  params: Promise<{ id: string }>;
  searchParams: { payment_intent: string };
}) => {
  const { id } = await props.params;
  const { payment_intent: paymentIntentId } = props.searchParams;

  const order = await getOrderById(id);
  if (!order) notFound();

  //   retrieve paymentintent through stripe paymentintent id
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (
    !paymentIntent ||
    paymentIntent.metadata.orderId === null || // we got orderid when we created the payment intent.metadata object in the order detail page
    paymentIntent.metadata.orderId !== order.id.toString()
  )
    notFound();

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
};

export default SuccessPage;
