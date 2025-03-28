"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertPrismaObj, formatErrors } from "../utils";
import { getMyCart } from "./cart.actions";
import { auth } from "@/auth";
import { getUserById } from "./auth.actions";
import { InsertOrderSchema } from "../validators";
import { CartItem, PaymentResult } from "@/types";
import { prisma } from "@/db/prisma";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";

// create order and order items
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User not found");

    const cart = await getMyCart();
    const userId = session?.user?.id;

    if (!userId) throw new Error("User not found");

    const user = await getUserById(userId);

    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        success: false,
        message: "No items in the cart",
        error: "No items in the cart",
        redirectTo: "/cart",
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: "No address found",
        error: "No address found",
        redirectTo: "/shipping-address",
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No payment method found",
        error: "No payment method found",
        redirectTo: "/payment-method",
      };
    }

    // create order object
    const order = InsertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      taxPrice: cart.taxPrice,
      shippingPrice: cart.shippingPrice,
      totalPrice: cart.totalPrice,
    });

    // create TRANSACTION to create order and order items in db (transaction is a way to say that if in the process one thing goes wrong the whole process is rolled back)

    // we use the $transaction method to create a transaction
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // create order
      const insertedOrder = await tx.order.create({ data: order });

      //create order items from cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }

      // clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          itemsPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          totalPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error("Order not created");

    return {
      success: true,
      message: "Order created successfully",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: formatErrors(error),
      error: "Order not created",
    };
  }
}

// get order by id
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true, // when we get the order itself we also want to get the order items
      user: { select: { name: true, email: true } }, // we also want to get the user that made the order
    },
  });

  console.log(
    "Order raw data:",
    data?.orderitems?.map((i) => typeof i.price)
  );

  return convertPrismaObj(data);
}

// revalidate path vs refresh: revalidate path is used to revalidate the path of the order page, it is used to update the data of the order page

// create new PayPal order
export async function createPayPalOrder(orderId: string) {
  // paypal order id is not the same as the order id in the database, it is used to create the order in the paypal api
  try {
    // get order from db
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (order) {
      // the create a new paypaal order
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice)); // include the total as the price of the order

      // update order with paypal order id
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: "",
            price_paid: 0,
          },
          isPaid: false,
        },
      });

      return {
        success: true,
        message: "PayPal order created successfully",
        data: paypalOrder.id,
      };
    } else {
      throw new Error("Order not found");
    }
  } catch (error) {
    return { success: false, message: formatErrors(error) };
  }
}

//approve paypal order and update order to paid (isPaid, paidAt, paymentResult)
export async function approvePayPalOrder(
  orderId: string,
  data: { paypalOrderId: string }
) {
  // orderId is the order id in the database, data is the order id returned by paypal after the user approves the order in paypal
  try {
    // get order from db
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error("Order not found");

    const capturedData = await paypal.capturePayment(data.paypalOrderId); // capture the payment in the paypal api

    if (
      !capturedData ||
      capturedData.id !== (order.paymentResult as PaymentResult).id ||
      capturedData.status !== "COMPLETED"
    ) {
      throw new Error("error in paypal payment");
    }

    const paymentresultObject = {
      id: capturedData.id,
      email_address: capturedData.payer.email_address,
      status: capturedData.status,
      price_paid:
        capturedData.purchase_units[0].payments.captures[0].amount.value,
    };

    // update order page with payment result
    await updateOrderToPaid({
      orderId,
      paymentResult: paymentresultObject,
    });

    revalidatePath(`/order/${orderId}`); // revalidate the order page to update the data of the order page

    return {
      success: true,
      message: "Order paid successfully",
      data: capturedData,
    };
  } catch (error) {
    return { success: false, message: formatErrors(error) };
  }
}

// update order to paid
async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { orderitems: true }, //include is used to get the order items of the order
    });

    if (!order) throw new Error("Order not found");
    if (order.isPaid === true) throw new Error("Order already paid");

    // transaction to update order and order items
    await prisma.$transaction(async (tx) => {
      // iterate over order items and update the price to string

      // foreach order item we need to update the price to string
      for (const item of order.orderitems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: -item.qty }, // decreasing the stock of the store of the product by the quantity of the order item
          },
        });
      }

      // set the order to paid
      await tx.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paymentResult,
        },
      });
    });

    // getUpdates order after transaction
    const updatedOrder = await prisma.order.findFirst({
      where: { id: orderId },
      include: {
        orderitems: true,
        user: { select: { name: true, email: true } },
      }, //include is used to get the order items of the order and the user that made the order
    });

    if (!updatedOrder) throw new Error("Order not found");
  } catch (error) {
    return formatErrors(error);
  }
}
