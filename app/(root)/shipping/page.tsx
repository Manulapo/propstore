import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { Metadata } from "next";
import { Redirect } from "next/navigation";
import { shippingAddress } from "@/types";
import { getUserById } from "@/lib/actions/auth.actions";

export const metadata: Metadata = {
  title: "Shipping Address",
  description: "Enter your shipping address",
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) {
    return <Redirect to="/cart" />;
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not found");
  }

  const user = await getUserById(userId);

  return <>Address</>;
};

export default ShippingAddressPage;
