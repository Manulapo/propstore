"use server";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/db/prisma";
import { ShippingAddress } from "@/types";
import { hashSync } from "bcrypt-ts-edge";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";
import { formatErrors } from "../utils";
import {
  PaymentMethodSchema,
  ShippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  updateProfileSchema,
  updateUserSchema,
} from "../validators";
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { JsonValue } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";
import { getMyCart } from "./cart.actions";
import { requireAdminSession, requireUserSession } from "../auth-guard";
import { USER_ROLES } from "../constants";

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
  if (currentCart) {
    await prisma.cart.delete({ where: { id: currentCart.id } });
  }
  await signOut({ redirect: true });
};

// get user by id
export async function getUserById(userId: string): Promise<{
  email: string;
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
  const session = await requireUserSession();
  if (session.user.id !== userId && session.user.role !== "admin") {
    throw new Error("Not authorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      address: true,
      paymentMethod: true,
    },
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
    const session = await requireUserSession();
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
    const session = await requireUserSession();
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
    const session = await requireUserSession();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    const profile = updateProfileSchema.parse(user);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: profile.name,
        email: profile.email,
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
  await requireAdminSession();

  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.floor(limit), 1), 100)
    : PAGE_SIZE;
  const safePage = Number.isFinite(page) ? Math.max(Math.floor(page), 1) : 1;
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
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      role: true,
    },
    orderBy: { createdAt: "desc" },
    take: safeLimit,
    skip: (safePage - 1) * safeLimit,
  });

  const dataCount = await prisma.user.count({ where: queryFilter });

  return {
    data,
    totalPages: Math.ceil(dataCount / safeLimit),
  };
}

// delete user by id
export async function deleteUserById(id: string) {
  try {
    const session = await requireAdminSession();
    if (session.user.id === id) throw new Error("You cannot delete yourself");

    const historicalOrders = await prisma.order.count({ where: { userId: id } });
    if (historicalOrders > 0) {
      throw new Error("Users with order history cannot be deleted");
    }

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
    const session = await requireAdminSession();
    if (session.user.id === user.id && user.role !== "admin") {
      throw new Error("You cannot remove your own admin access");
    }

    const validatedUser = updateUserSchema.parse(user);
    if (!USER_ROLES.includes(validatedUser.role)) {
      throw new Error("Invalid user role");
    }
    await prisma.user.update({
      where: { id: validatedUser.id },
      data: {
        name: validatedUser.name,
        role: validatedUser.role,
      },
    });
    revalidatePath("/admin/users/");

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    return { success: false, message: formatErrors(error) };
  }
}
