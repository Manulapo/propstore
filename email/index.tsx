import { Resend } from "resend";
import { SENDER_EMAIL, APP_NAME } from "@/lib/constants";
import PurchaseReceiptEmail from "./purchase-receipt";
import { Order } from "@/types";
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY || "");

export const sendPurchaseReceipt = async ({
  order,
}: {
  order: Order;
}) => {
  await resend.emails.send({
    from: APP_NAME + ` <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Order confirmation ${order.id}`,
    react: <PurchaseReceiptEmail order={order} />,
  });
};
