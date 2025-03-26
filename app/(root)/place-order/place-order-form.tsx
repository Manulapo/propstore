"use client";

import { createOrder } from "@/lib/actions/order-actions";
import { useFormStatus } from "react-dom";
import { Check, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// useFormStatus is a hook that returns the status of the form
// it can be one of the following: "idle", "loading", "success", "error"
//their structure is as follows:
// {
//   status: "idle" | "loading" | "success" | "error";
//   message?: string;
// }
// you can use this hook to show a loading spinner, success message or error message
const PlaceHolderButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Check className="w-4 h-4" /> 
        </>
      )}{' '}Place Order
    </Button>
  );
};

const PlaceOrderForm = () => {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createOrder();

    if (res.redirectTo) {
      router.push(res.redirectTo);
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <PlaceHolderButton />
    </form>
  );
};

export default PlaceOrderForm;
