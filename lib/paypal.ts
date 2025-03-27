const base = process.env.PAYPAL_API_URL || "https://sandbox.paypal.com";

export const paypal = {}; // PayPal API client

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

  if(response.ok) {
    const jsonData = await response.json(); // this is the json data returned by the paypal api, it contains the access token and the type of token
    return jsonData.access_token; // this is the access token returned by the paypal api, it is used to authenticate the requests made to the paypal api
  }else {
    const error = await response.text(); // this is the error returned by the paypal api, it is used to handle the error in the code
    throw new Error(error); // this is the error thrown by the paypal api, it is used to handle the error in the code
  }
}
