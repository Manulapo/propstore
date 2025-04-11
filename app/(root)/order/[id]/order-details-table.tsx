"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  approvePayPalOrder,
  createPayPalOrder,
  updateCODOrderToPaid,
  deliverOrder,
} from "@/lib/actions/order-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order } from "@/types";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import StripePayment from "./stripe-payment";

const PrintLoadingState = () => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  let status = "";

  if (isPending) {
    status = "Loading PayPal...";
  } else if (isRejected) {
    status = "Error loading PayPal";
  }

  return status;
};

// mark the order as paid
const MarkAsPaidButton = ({ order }: { order: { id: string } }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <Button
      type="button"
      onClick={() =>
        startTransition(async () => {
          const res = await updateCODOrderToPaid(order.id);
          toast({
            description: res.message,
            variant: res.success ? "default" : "destructive",
          });
        })
      }
      disabled={isPending}
    >
      {isPending ? <Loader className="w-4 h-4 animate-spin" /> : "Mark as Paid"}
    </Button>
  );
};

// mark the order as delivered
const MarkAsDeliveredButton = ({ order }: { order: { id: string } }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <Button
      type="button"
      onClick={() =>
        startTransition(async () => {
          const res = await deliverOrder(order.id);
          toast({
            description: res.message,
            variant: res.success ? "default" : "destructive",
          });
        })
      }
      disabled={isPending}
    >
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        "Mark as Delivered"
      )}
    </Button>
  );
};

const OrderDetailTable = ({
  order,
  paypalClientId,
  isAdmin,
  stripeClientSecret,
}: {
  order: Order;
  paypalClientId: string;
  isAdmin: boolean;
  stripeClientSecret: string;
}) => {
  const {
    shippingAddress,
    orderItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    isDelivered,
    paidAt,
    deliveredAt,
  } = order as Order;
  const { toast } = useToast();

  const handleCreatePaypalOrder = async () => {
    const res = await createPayPalOrder(order.id);

    if (!res.success) {
      toast({
        description: res.message,
        variant: "destructive",
      });
    }

    return res.data;
  };

  const handleApprovePaypalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, {
      paypalOrderId: data.orderID,
    });

    toast({
      description: res.message,
      variant: res.success ? "default" : "destructive",
    });
  };

  return (
    <>
      <h1 className="py-4 text-2xl">
        <span className="font-bold">Order</span> {order.id}
      </h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-4-y overflow-x-auto">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p className="mb-2">{paymentMethod}</p>
              {isPaid ? (
                <Badge variant={"secondary"}>
                  Paid at {formatDate(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant={"destructive"}>Not Paid</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="my-2">
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p className="mb-2">
                {shippingAddress.streetAddress}, {shippingAddress.city}
              </p>
              <p>
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              {isDelivered ? (
                <Badge variant={"secondary"}>
                  Delivered at {formatDate(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant={"destructive"}>Not Delivered</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="my-2">
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.qty}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-right">${item.price}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between font-bold">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {/*Paypal payment*/}
              {!isPaid && paymentMethod === "PayPal" && (
                <div>
                  <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePaypalOrder}
                      onApprove={handleApprovePaypalOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              )}
              {/* Stripe payment */}
              {!isPaid && paymentMethod === "Stripe" && (
                <StripePayment
                  priceInCents={Math.round(Number(totalPrice) * 100)}
                  clientSecret={stripeClientSecret}
                  orderId={order.id}
                />
              )}
              {/*Cash on delivery payment*/}
              {isAdmin && !isPaid && paymentMethod === "CashOnDelivery" && (
                <MarkAsPaidButton order={order} />
              )}
              {isAdmin && isPaid && !isDelivered && (
                <MarkAsDeliveredButton order={order} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailTable;
