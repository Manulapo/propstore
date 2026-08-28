import { prisma } from "@/db/prisma";
import { sendPurchaseReceipt } from "@/email";
import { PaymentResult, ShippingAddress, Order } from "@/types";

/**
 * Finalize an already-authorized payment. Callers must authenticate and
 * validate the payment-provider event before invoking this server-only helper.
 * The conditional order update makes retries idempotent and prevents a second
 * request from decrementing inventory twice.
 */
export async function finalizeOrderPayment({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  const finalized = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { orderitems: true },
    });

    if (!order) throw new Error("Order not found");
    if (order.isPaid) return false;

    const claim = await tx.order.updateMany({
      where: { id: orderId, isPaid: false },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });

    if (claim.count === 0) return false;

    for (const item of order.orderitems) {
      const stockUpdate = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.qty } },
        data: { stock: { decrement: item.qty } },
      });

      if (stockUpdate.count !== 1) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }

    return true;
  });

  if (!finalized) return false;

  const updatedOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!updatedOrder) throw new Error("Order not found");

  if (updatedOrder.user.email) {
    try {
      await sendPurchaseReceipt({
        order: {
          ...updatedOrder,
          user: {
            ...updatedOrder.user,
            name: updatedOrder.user.name || "",
            email: updatedOrder.user.email,
          },
          shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
          paymentResult: updatedOrder.paymentResult as PaymentResult | null,
          orderItems: updatedOrder.orderitems.map((item) => ({
            ...item,
            price: item.price.toString(),
          })),
        } as Order,
      });
    } catch (error) {
      // Payment and inventory state must not be reported as failed because an
      // optional receipt provider is unavailable.
      console.error("Failed to send purchase receipt", error);
    }
  }

  return true;
}
