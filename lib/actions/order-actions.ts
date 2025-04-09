"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToJSObject, formatErrors } from "../utils";
import { getMyCart } from "./cart.actions";
import { auth } from "@/auth";
import { getUserById } from "./user.actions";
import { InsertOrderSchema } from "../validators";
import { CartItem, PaymentResult } from "@/types";
import { prisma } from "@/db/prisma";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

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

  return convertToJSObject(data);
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

// get user's orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page?: number;
}) {
  const session = await auth();
  if (!session) throw new Error("User not found");

  // find all the orders of the user
  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" }, // order by createdAt desc
    take: limit, // limit the number of orders to the page size
    skip: page ? (page - 1) * limit : 0, // skip the number of orders to the page size
  });

  const dataCount = await prisma.order.count({
    where: { userId: session?.user?.id },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit), // total pages is the total number of orders divided by the page size
  };
}

// get sales data and order summary
export async function getOrderSummary() {
  // get the counts for products, orders, users
  const ordersCount = await prisma.order.count();
  const usersCount = await prisma.user.count();
  const productsCount = await prisma.product.count();

  // calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true }, // sum the total price of all orders
  });

  // get montly sales by get forst them with a raw query and then group them by month
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: SalesDataType = salesDataRaw.map((item) => ({
    month: item.month,
    totalSales: Number(item.totalSales),
  }));

  // get latest sales (latest six)
  const takeLimit = 6; // limit the number of latest sales to 6
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: takeLimit, // get the latest six orders
    include: {
      //include allows us to get the order items and the user that made the order
      user: { select: { name: true } },
    },
  });

  return {
    ordersCount,
    usersCount,
    productsCount,
    totalSales,
    latestSales,
    salesData,
  };
}

// get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page?: number;
  query: string;
}) {
  const queryFilter: Prisma.OrderWhereInput =
    query && query !== "all"
      ? {
          user: {
            name: { contains: query, mode: "insensitive" },
          },
        }
      : {}; // filter by query or empty object

  const data = await prisma.order.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: "desc" }, // order by createdAt desc
    take: limit, // limit the number of orders to the page size
    skip: page ? (page - 1) * limit : 0, // skip the number of orders to the page size
    include: {
      user: { select: { name: true } },
    },
  });

  const dataCount = await prisma.order.count(); // get the total number of orders

  return {
    data,
    totalPages: Math.ceil(dataCount / limit), // total pages is the total number of orders divided by the page size
  };
}

// delete an order
export async function deleteOrder(id: string) {
  try {
    const session = await auth();
    if (!session) throw new Error("User not found");

    if (session.user.role !== "admin") {
      throw new Error("Not authorized to delete this order");
    }

    await prisma.order.delete({
      where: { id },
    });

    revalidatePath("/admin/orders"); // revalidate the orders page to update the data of the orders page

    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatErrors(error) };
  }
}

// update COD order to paid
export async function updateCODOrderToPaid(orderId: string) {
  try {
    await updateOrderToPaid({
      orderId,
    });

    revalidatePath(`/order/${orderId}`); // revalidate the order page to update the data of the order page

    return {
      success: true,
      message: "Order paid successfully",
    };
  } catch (error) {
    return { success: false, message: formatErrors(error) };
  }
}

// update cod order to delivered
export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) throw new Error("Order not found");
    if (order.isDelivered) throw new Error("Order already delivered");
    if (!order.isPaid) throw new Error("Order not paid");

    // update order to delivered
    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`); // revalidate the order page to update the data of the order page
    return {
      success: true,
      message: "Order has been marked as delivered",
    };
  } catch (error) {
    return { success: false, message: formatErrors(error) };
  }
}
