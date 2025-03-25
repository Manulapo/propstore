"use server";
import { auth, signIn } from "@/auth";
import { prisma } from "@/db/prisma";
import { ShippingAddress } from "@/types";
import { hashSync } from "bcrypt-ts-edge";
import { signOut } from "next-auth/react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";
import { formatErrors } from "../utils";
import {
  PaymentMethodSchema,
  ShippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
} from "../validators";

export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;

    // Hash the password
    user.password = hashSync(user.password, 10);

    // create user in the database
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    // Attempt sign in
    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "Signed up successfully" };
  } catch (error) {
    // Handle redirect errors from Next.js
    if (isRedirectError(error)) throw error;

    return {
      success: false,
      message: formatErrors(error),
      error: "User not registered",
    };
  }
}

export async function signinUserWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    // Validate form data
    const credentials = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Attempt sign in
    await signIn("credentials", {
      ...credentials,
    });

    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (error) {
    // Handle redirect errors from Next.js
    if (isRedirectError(error)) throw error;

    return {
      success: false,
      message: formatErrors(error),
      error: "Please check your email and password",
    };
  }
}

export const signOutUser = async () => {
  await signOut({ redirect: true });
};

// get user by id
export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// update the users address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findUnique({
      where: { id: session?.user?.id },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    const address = ShippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });
    return { success: true, message: "Address updated successfully" };
  } catch (error) {
    return { success: false, message: formatErrors(error) };
  }
}

// update user paymemnt method
export async function updateUserPaymentMethod(
  data: z.infer<typeof PaymentMethodSchema>
) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    const paymentMethod = PaymentMethodSchema.parse(data); // validate the payment method
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return { success: true, message: "Payment method updated successfully" };
  } catch (error) {
    return { success: false, message: formatErrors(error) };
  }
}
