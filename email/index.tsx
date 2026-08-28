import { Resend } from "resend";
import "dotenv/config";
import { SENDER_EMAIL, APP_NAME } from "@/lib/constants";
import PurchaseReceiptEmail from "./purchase-receipt";
import { Order } from "@/types";
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(apiKey);
};

export const sendPurchaseReceipt = async ({
  order,
}: {
  order: Order;
}) => {
  await getResend().emails.send({
    from: APP_NAME + ` <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Order confirmation ${order.id}`,
    react: <PurchaseReceiptEmail order={order} />,
  });
};
