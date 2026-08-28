import { generateAccessToken, paypal } from "../lib/paypal";

describe("PayPal demo provider", () => {
  test("returns a compatibility access token without network access", async () => {
    await expect(generateAccessToken()).resolves.toBe("mock-paypal-access-token");
  });

  test("creates a local demo order", async () => {
    const order = await paypal.createOrder(10);

    expect(order.id).toMatch(/^MOCK_PAYPAL_10\.00_/);
    expect(order.status).toBe("CREATED");
    expect(order.purchase_units[0].amount.value).toBe("10.00");
  });

  test("captures a local demo order with the original amount", async () => {
    const order = await paypal.createOrder(10);
    const capture = await paypal.capturePayment(order.id);

    expect(capture.id).toBe(order.id);
    expect(capture.status).toBe("COMPLETED");
    expect(capture.purchase_units[0].payments.captures[0].amount.value).toBe(
      "10.00"
    );
  });
});
