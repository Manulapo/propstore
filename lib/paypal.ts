const base = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

export const paypal = {
  createOrder: async function createOrder(price: number) {
    const accessToken = await generateAccessToken(); // this is the access token returned by the paypal api, it is used to authenticate the requests made to the paypal api
    const url = `${base}/v2/checkout/orders`; // this is the url of the paypal api, it is used to create the order in the paypal api

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`, // this is the access token returned by the paypal api, it is used to authenticate the requests made to the paypal api
        "Content-Type": "application/json", // this is the content type of the request, it is used to specify the type of data being sent in the request body, in this case, it is json data
      },
      body: JSON.stringify({
        intent: "CAPTURE", // this is the intent of the order, it is used to specify the type of order being created, in this case, it is a capture order
        purchase_units: [
          {
            amount: {
              currency_code: "USD", // this is the currency code of the order, it is used to specify the currency of the order, in this case, it is USD
              value: price.toString(), // this is the value of the order, it is used to specify the amount of the order, in this case, it is the price passed to the function
            },
          },
        ],
      }),
    });

    return handleResponse(response); // this is the json data returned by the paypal api, it contains the order id and the status of the order
  },
  capturePayment: async function capturePayment(orderId: string) {
    const accessToken = await generateAccessToken(); // this is the access token returned by the paypal api, it is used to authenticate the requests made to the paypal api
    const url = `${base}/v2/checkout/orders/${orderId}/capture`; // this is the url of the paypal api, it is used to capture the payment in the paypal api

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`, // this is the access token returned by the paypal api, it is used to authenticate the requests made to the paypal api
        "Content-Type": "application/json", // this is the content type of the request, it is used to specify the type of data being sent in the request body, in this case, it is json data
      },
    });

    return handleResponse(response);
  },
}; // PayPal API client

// generate paypal access token
async function generateAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_SECRET_ID } = process.env;
  // now i have to generate the access token using the client id and secret id but in base64 format, i use Buffer.from to convert the string to base64 format
  //buffer is a global object in nodejs, it is used to handle binary data, it is not a constructor, it is a class that is used to create buffer objects and then convert them to base64 format when needed.
  // the format is "client_id:secret_id"
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_ID}`).toString(
    "base64"
  );

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`, // this is the base64 encoded string of client id and secret id, basic states the type of authentication used, in this case, it is basic authentication
      "Content-Type": "application/x-www-form-urlencoded", // this is the content type of the request, it is used to specify the type of data being sent in the request body, in this case, it is url encoded form data
    },
    body: "grant_type=client_credentials",
  });

  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}

// check response status
async function handleResponse(response: Response) {
  if (response.ok) {
    return response.json(); // this is the json data returned by the paypal api, it contains the order id and the status of the order
  } else {
    const error = await response.text(); // this is the error returned by the paypal api, it is used to handle the error in the code
    throw new Error(error); // this is the error thrown by the paypal api, it is used to handle the error in the code
  }
}

export { generateAccessToken };
