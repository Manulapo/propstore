import { auth } from "@/auth";
import SignInCredentialsForm from "@/components/forms/sign-in.credentials";
import AppLogo from "@/components/shared/app-logo";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

const SignInPage = async (props: {
  searchParams: Promise<{ callbackUrl: string }>;
}) => {
  const { callbackUrl } = await props.searchParams;
  const isLogged = await auth(); //in a server component we get the isLogged as written. in a client component we get the session with the hook useSession()

  if (isLogged) {
    return redirect(callbackUrl || "/");
    //that will work both for the first sign in and for the case when the user is already logged in and try to access the sign in page
    //the callbackUrl is the page the user was trying to access before being redirected to the sign in page. if there wasa no callbackUrl, the user will be redirected to that url, otherwise to the home page
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <AppLogo size={100} />
          </Link>
          <CardTitle className="text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
          <CardContent className="space-y-4">
            <SignInCredentialsForm />
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SignInPage;
