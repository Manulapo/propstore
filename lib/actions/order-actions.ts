"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToJSObject, formatErrors } from "../utils";
import { calcPrice, getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { InsertOrderSchema } from "../validators";
import { CartItem, PaymentResult } from "@/types";
import { prisma } from "@/db/prisma";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { CURRENCY_CODE, PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";
import { requireAdminSession, requireUserSession } from "../auth-guard";
import { finalizeOrderPayment } from "../order-payment";

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

// create order and order items
export async function createOrder() {
  try {
    const session = await requireUserSession();

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

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const cartItems = cart.items as CartItem[];
      const products = await tx.product.findMany({
        where: { id: { in: cartItems.map((item) => item.productId) } },
      });
      const productsById = new Map(products.map((product) => [product.id, product]));

      const orderItems = cartItems.map((item) => {
        const product = productsById.get(item.productId);
        if (!product) throw new Error("A product in your cart no longer exists");
        if (item.qty <= 0 || item.qty > product.stock) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        return {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0],
          qty: item.qty,
          price: product.price.toString(),
        } satisfies CartItem;
      });

      const prices = await calcPrice(orderItems);
      const order = InsertOrderSchema.parse({
        userId: user.id,
        shippingAddress: user.address,
        paymentMethod: user.paymentMethod,
        ...prices,
      });

      const insertedOrder = await tx.order.create({ data: order });

      for (const item of orderItems) {
        await tx.orderItem.create({
          data: {
            ...item,
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
  const session = await requireUserSession();
  const data = await prisma.order.findFirst({
    where:
      session.user.role === "admin"
        ? { id: orderId }
        : { id: orderId, userId: session.user.id },
    include: {
      orderitems: true, // when we get the order itself we also want to get the order items
      user: { select: { name: true, email: true } }, // we also want to get the user that made the order
    },
  });

  return convertToJSObject(data);
}

// revalidate path vs refresh: revalidate path is used to revalidate the path of the order page, it is used to update the data of the order page

// create new PayPal order
export async function createPayPalOrder(orderId: string) {
  // paypal order id is not the same as the order id in the database, it is used to create the order in the paypal api
  try {
    const session = await requireUserSession();
    // get order from db
    const order = await prisma.order.findFirst({
      where:
        session.user.role === "admin"
          ? { id: orderId }
          : { id: orderId, userId: session.user.id },
    });

    if (order) {
      if (order.paymentMethod !== "PayPal") {
        throw new Error("This order does not use PayPal demo payment");
      }
      if (order.isPaid) throw new Error("Order already paid");

      // the create a new paypaal order
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice)); // include the total as the price of the order

      // update order with paypal order id
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: paypalOrder.status,
            price_paid: order.totalPrice.toString(),
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
    const session = await requireUserSession();
    // get order from db
    const order = await prisma.order.findFirst({
      where:
        session.user.role === "admin"
          ? { id: orderId }
          : { id: orderId, userId: session.user.id },
    });

    if (!order) throw new Error("Order not found");
    if (order.paymentMethod !== "PayPal") {
      throw new Error("This order does not use PayPal demo payment");
    }
    if (order.isPaid) throw new Error("Order already paid");

    const storedPayment = order.paymentResult as PaymentResult | null;
    if (!storedPayment?.id) throw new Error("PayPal demo order not initialized");

    const capturedData = await paypal.capturePayment(data.paypalOrderId); // capture the payment in the paypal api

    if (
      !capturedData ||
      capturedData.id !== storedPayment.id ||
      capturedData.status !== "COMPLETED"
    ) {
      throw new Error("error in paypal payment");
    }

    const capturedAmount = Number(
      capturedData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value
    );
    const capturedCurrency =
      capturedData.purchase_units?.[0]?.payments?.captures?.[0]?.amount
        ?.currency_code;
    if (
      !Number.isFinite(capturedAmount) ||
      capturedAmount !== Number(order.totalPrice) ||
      capturedCurrency !== CURRENCY_CODE
    ) {
      throw new Error("PayPal demo amount does not match the order");
    }

    const paymentresultObject = {
      id: capturedData.id,
      email_address: capturedData.payer.email_address,
      status: capturedData.status,
      price_paid:
        capturedData.purchase_units[0].payments.captures[0].amount.value,
    };

    // update order page with payment result
    await finalizeOrderPayment({
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

// get user's orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page?: number;
}) {
  const session = await requireUserSession();
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.floor(limit), 1), 100)
    : PAGE_SIZE;
  const safePage =
    page != null && Number.isFinite(page) ? Math.max(Math.floor(page), 1) : 1;

  // find all the orders of the user
  const data = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }, // order by createdAt desc
    take: safeLimit,
    skip: (safePage - 1) * safeLimit,
  });

  const dataCount = await prisma.order.count({
    where: { userId: session.user.id },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / safeLimit),
  };
}

// get sales data and order summary
export async function getOrderSummary() {
  await requireAdminSession();

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
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY') ORDER BY min("createdAt")`;

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
  await requireAdminSession();
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.floor(limit), 1), 100)
    : PAGE_SIZE;
  const safePage =
    page != null && Number.isFinite(page) ? Math.max(Math.floor(page), 1) : 1;
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
    take: safeLimit,
    skip: (safePage - 1) * safeLimit,
    include: {
      user: { select: { name: true } },
    },
  });

  const dataCount = await prisma.order.count({ where: queryFilter });

  return {
    data,
    totalPages: Math.ceil(dataCount / safeLimit),
  };
}

// delete an order
export async function deleteOrder(id: string) {
  try {
    await requireAdminSession();

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
    await requireAdminSession();
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");
    if (order.paymentMethod !== "CashOnDelivery") {
      throw new Error("Only cash-on-delivery orders can be marked paid here");
    }

    await finalizeOrderPayment({ orderId });

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
    await requireAdminSession();
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
