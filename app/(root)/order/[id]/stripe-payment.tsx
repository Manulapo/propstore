import { Button } from "@/components/ui/button";
import { SERVER_URL } from "@/lib/constants";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

const StripePayment = ({
  priceInCents,
  orderId,
  clientSecret,
}: {
  priceInCents: number;
  orderId: string;
  clientSecret: string;
}) => {
  // well be using this to create a payment intent and confirm the payment
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
  );

  const { theme, systemTheme } = useTheme();

  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [email, setEmail] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (stripe === null || email === null || elements === null) return;
      setIsLoading(true);
      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            //this is the redirect url after payment
            return_url: `${SERVER_URL}/order/${orderId}/stripe-payment/success`,
          },
        })
        .then(({ error }) => {
          switch (error?.type) {
            case "card_error":
            case "validation_error":
              setErrorMessage(error.message ?? "An unknown error occurred");
              break;
            case "api_error":
              setErrorMessage(
                "An error occurred while processing your payment"
              );
              break;
            default:
              setErrorMessage("An unknown error occurred");
          }
        })
        .finally(() => setIsLoading(false));
    };

    return (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="text-xl">Stripe Checkout</div>
        {errorMessage && <div className="text-destructive">{errorMessage}</div>}
        <PaymentElement />
        <div>
          <LinkAuthenticationElement
            onChange={(e) => {
              setEmail(e.value.email);
            }}
          />
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={stripe == null || elements == null || isLoading}
        >
          {isLoading ? (
            <Loader className="animate-spin h-4 w-4" />
          ) : (
            `Pay $${priceInCents / 100}`
          )}
        </Button>
      </form>
    );
  };

  return (
    <Elements
      options={{
        clientSecret: clientSecret,
        appearance: {
          theme:
            theme === "dark"
              ? "night"
              : theme === "light"
              ? "stripe"
              : systemTheme === "light"
              ? "stripe"
              : "night",
        },
      }}
      stripe={stripePromise}
    >
      <StripeForm />
    </Elements>
  );
};

export default StripePayment;
