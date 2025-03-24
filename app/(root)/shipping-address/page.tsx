import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/auth.actions";
import { getMyCart } from "@/lib/actions/cart.actions";
import { ShippingAddress } from "@/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import ShippingAddressForm from "./shipping-address-form";
import CheckOutSteps from "@/components/shared/checkout-steps";

export const metadata: Metadata = {
  title: "Shipping Address",
  description: "Enter your shipping address",
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) {
    return redirect("/cart");
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return redirect("/sign-in");
  }

  const user = await getUserById(userId);

  return (
    <>
      <CheckOutSteps current={1} />
      <ShippingAddressForm address={user.address as ShippingAddress} />
    </>
  );
};

export default ShippingAddressPage;
