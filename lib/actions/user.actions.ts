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
  updateUserSchema,
} from "../validators";
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { JsonValue } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";
import { getMyCart } from "./cart.actions";

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
  // get current users cart and delete it so it does not persist to next user
  const currentCart = await getMyCart();
  await prisma.cart.delete({ where: { id: currentCart?.id } });
  await signOut({ redirect: true });
};

// get user by id
export async function getUserById(userId: string): Promise<{
  email: string;
  password: string | null;
  id: string;
  createdAt: Date;
  paymentMethod: string | null;
  name: string;
  image: string | null;
  emailVerified: Date | null;
  updatedAt: Date;
  role: string;
  address: JsonValue | null;
}> {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });

  if (!user || !user.email || !user.name) {
    throw new Error(
      "User not found or missing required fields (email or name)"
    );
  }

  return { ...user, email: user.email, name: user.name };
}

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

// update user profile
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: user.name,
        email: user.email,
      },
    });

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    return { success: false, message: formatErrors(error) };
  }
}

// get all users with pagination
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter: Prisma.UserWhereInput =
    query && query !== "all"
      ? {
          name: { contains: query, mode: "insensitive" } as Prisma.StringFilter,
        }
      : {}; // filter by query or empty object

  const data = await prisma.user.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit, // page - 1 because page is 1 indexed and skip is 0 indexed
  });

  const dataCount = await prisma.user.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// delete user by id
export async function deleteUserById(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/admin/users"); // revalidate the users page to reflect the changes

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    return { success: false, message: formatErrors(error) };
  }
}

// update user
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    });
    revalidatePath("/admin/users/");

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    return { success: false, message: formatErrors(error) };
  }
}
