import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  } else if (session.user.role !== "admin") {
    redirect("/unauthorized"); // Redirect to an unauthorized page or handle as needed
  }

  return session;
}
