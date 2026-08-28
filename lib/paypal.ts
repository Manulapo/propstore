/**
 * PayPal demo provider.
 *
 * This project intentionally does not perform a real PayPal checkout. The
 * provider shape is kept so the order flow can demonstrate create/capture
 * states without external credentials or network calls.
 */
export type MockPayPalOrder = {
  id: string;
  status: "CREATED";
  purchase_units: [{ amount: { currency_code: string; value: string } }];
};

export type MockPayPalCapture = {
  id: string;
  status: "COMPLETED";
  payer: { email_address: string };
  purchase_units: [
    {
      payments: {
        captures: [{ amount: { currency_code: string; value: string } }];
      };
    },
  ];
};

const currency = process.env.NEXT_PUBLIC_CURRENCY_CODE || "EUR";

export const paypal = {
  async createOrder(price: number): Promise<MockPayPalOrder> {
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Invalid PayPal demo amount");
    }

    const value = price.toFixed(2);
    return {
      id: `MOCK_PAYPAL_${value}_${crypto.randomUUID()}`,
      status: "CREATED",
      purchase_units: [{ amount: { currency_code: currency, value } }],
    };
  },

  async capturePayment(orderId: string): Promise<MockPayPalCapture> {
    const match = /^MOCK_PAYPAL_(\d+\.\d{2})_[0-9a-f-]+$/i.exec(orderId);
    if (!match) throw new Error("Invalid PayPal demo order");

    return {
      id: orderId,
      status: "COMPLETED",
      payer: { email_address: "demo-paypal@example.com" },
      purchase_units: [
        {
          payments: {
            captures: [
              { amount: { currency_code: currency, value: match[1] } },
            ],
          },
        },
      ],
    };
  },
};

// Retained for compatibility with the original demo test/API surface.
export async function generateAccessToken() {
  return "mock-paypal-access-token";
}
