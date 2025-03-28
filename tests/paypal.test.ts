import { generateAccessToken, paypal } from "../lib/paypal";

// test to generate access token from paypal api
test("generate access token", async () => {
  const tokenResponse = await generateAccessToken();
  console.log(tokenResponse); // this is the access token returned by the paypal api, it is used to authenticate the requests made to the paypal api

  expect(typeof tokenResponse).toBe("string"); // this is the type of the access token returned by the paypal api, it is used to authenticate the requests made to the paypal api
  expect(tokenResponse.length).toBeGreaterThan(0); // this is the length of the access token returned by the paypal api, it is used to authenticate the requests made to the paypal api
});


// test to create order from paypal api
test("create order", async () => {
  const price = 10.0; // this is the price of the order, it is used to specify the amount of the order, in this case, it is 10.0
  const orderResponse = await paypal.createOrder(price); // this is the order response returned by the paypal api, it contains the order id and the status of the order
  console.log(orderResponse); // this is the order response returned by the paypal api, it contains the order id and the status of the order

  expect(orderResponse).toHaveProperty("id"); // this is the id of the order returned by the paypal api, it is used to identify the order in the paypal api
  expect(orderResponse).toHaveProperty("status"); // this is the status of the order returned by the paypal api, it is used to identify the status of the order in the paypal api
  expect(orderResponse.status).toBe("CREATED"); // this is the status of the order returned by the paypal api, it is used to identify the status of the order in the paypal api
});


// test to capture payment with a mock order
test("simulate capturing payment from an order", async () => {
  const orderId = "100";

  // a spy is a function that is used to track the calls made to the function and the arguments passed to the function, it is used to test the function without actually calling the function
  const mockCapturePayment = jest
    .spyOn(paypal, "capturePayment") // set the object and the method to be spied on, in this case, it is the capturePayment method of the paypal object
    .mockResolvedValue({
      status: "COMPLETED", //set forced value of the function to be returned, since we are mocking the function
    }); // this is the mock response returned by the paypal api, it is used to simulate the capture payment from an order

  const captureResponse = await paypal.capturePayment(orderId); // this is the capture response returned by the paypal api, it is used to simulate the capture payment from an order

  expect(captureResponse).toHaveProperty("status"); // this is the status of the capture response returned by the paypal api, it is used to simulate the capture payment from an order
  expect(captureResponse.status).toBe("COMPLETED"); // this is the status of the capture response returned by the paypal api, it is used to simulate the capture payment from an order

  mockCapturePayment.mockRestore(); // this is used to restore the original implementation of the function after the test is done, it is used to test the function without actually calling the function
});
