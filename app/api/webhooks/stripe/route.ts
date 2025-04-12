import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrderToPaid } from "@/lib/actions/order-actions";

export async function POST(req: NextRequest) {
  // we are using Stripe to handle webhooks, so we need to verify the webhook signature
  // and then update the order to paid in our database
  const event = await Stripe.webhooks.constructEvent(
    await req.text(), // the raw body of the request
    req.headers.get("Stripe-Signature") as string, // the signature from Stripe
    process.env.STRIPE_WEBHOOK_SECRET as string // the webhook secret from Stripe
  );

  // Check if the event is a charge.succeeded event meaning the payment was successful
  // and update the order to paid in our database
  if (event.type === "charge.succeeded") {
    const { object } = event.data;
    // update the order status
    await updateOrderToPaid({
      orderId: object.metadata.orderId,
      paymentResult: {
        id: object.id,
        status: "COMPLETED",
        email_address: object.billing_details.email!,
        price_paid: (object.amount / 100).toFixed(), // convert to dollars because Stripe returns in cents
      },
    });

    return NextResponse.json({ message: "updateOrderToPaid was successful" });
  }

  return NextResponse.json({ message: "event is not charge.succeded" });
}
