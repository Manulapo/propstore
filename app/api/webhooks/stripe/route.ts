import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/db/prisma";
import { finalizeOrderPayment } from "@/lib/order-payment";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("Stripe-Signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json(
      { error: "Webhook is not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type !== "charge.succeeded") {
    return NextResponse.json({ received: true });
  }

  const charge = event.data.object as Stripe.Charge;
  const orderId = charge.metadata?.orderId;
  if (!orderId) {
    return NextResponse.json({ error: "Missing order metadata" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.paymentMethod !== "Stripe") {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const expectedAmount = Math.round(Number(order.totalPrice) * 100);
  const expectedCurrency = (
    process.env.NEXT_PUBLIC_CURRENCY_CODE || "EUR"
  ).toLowerCase();
  if (charge.amount !== expectedAmount || charge.currency !== expectedCurrency) {
    return NextResponse.json(
      { error: "Payment amount does not match order" },
      { status: 400 }
    );
  }

  await finalizeOrderPayment({
    orderId,
    paymentResult: {
      id: charge.id,
      status: "COMPLETED",
      email_address: charge.billing_details?.email || "",
      price_paid: (charge.amount / 100).toFixed(2),
    },
  });

  return NextResponse.json({ message: "Payment processed" });
}
