'use client';

import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useActionState } from "react";
import { signinUserWithCredentials } from "@/lib/actions/user.actions";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";

const SignInCredentialsForm = () => {
    const [data, action] = useActionState(signinUserWithCredentials, {
        success: false,
        message: '',
    });

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const SignInButton = () => {
        const { pending } = useFormStatus();
        return (
            <Button disabled={pending} className="w-full" variant={'default'}>
                {pending ? (<span className="loader"></span>) : 'Sign In'}
            </Button>
        );
    }

    return (
        <form action={action}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div className="space-y-6">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id='email' name="email" type='email' placeholder='Email' autoComplete="email" required />
                </div>
                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id='password' name="password" type='password' placeholder='Password' autoComplete="password" required />
                </div>
                <div>
                    <SignInButton />
                </div>
                {data && !data.success && (<div className="text-center text-destructive">{data.message}</div>)}
                <div className="text-small text-center text-muted-foreground">
                    Don&apos;t have an account? <Link href="/sign-up" target="_self" className="link">Sign Up</Link>
                </div>
            </div>
        </form>
    );
}

export default SignInCredentialsForm;