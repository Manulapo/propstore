'use server';

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signInFormSchema } from "../validators";

type AuthResponse = {
  success: boolean;
  message: string;
  error?: string;
};

export async function signinUserWithCredentials(
  _: unknown, 
  formData: FormData
): Promise<AuthResponse> {
  try {
    // Validate form data
    const credentials = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password')
    });

    // Attempt sign in
    await signIn('credentials', {
      ...credentials,
    });

    return {
      success: true,
      message: 'Signed in successfully'
    };

  } catch (error) {
    // Handle redirect errors from Next.js
    if (isRedirectError(error)) throw error;

    // Handle auth errors
    if (error instanceof AuthError) {
      return {
        success: false,
        message: 'Authentication failed',
        error: error.message
      };
    }

    return {
      success: false,
      message: 'Invalid credentials',
      error: 'Please check your email and password'
    };
  }
}

export async function signoutUser(): Promise<AuthResponse> {
  try {
    await signOut({ redirect: false });
    return {
      success: true,
      message: 'Signed out successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to sign out',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}