'use client';

import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { signUpDefaultValues } from "@/lib/constants";
import { useActionState } from "react";
import { signUpUser } from "@/lib/actions/user.actions";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";

const SignUpForm = () => {
    const [data, action] = useActionState(signUpUser, {
        success: false,
        message: '',
    });

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const SignUpButton = () => {
        const { pending } = useFormStatus();
        return (
            <Button disabled={pending} className="w-full" variant={'default'}>
                {pending ? (<span className="loader"></span>) : 'Sign up'}
            </Button>
        );
    }

    return (
        <form action={action}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div className="space-y-6">
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id='name' name="name" type='name' placeholder='Name' autoComplete="name" required defaultValue={signUpDefaultValues.name} />
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id='email' name="email" type='email' placeholder='Email' autoComplete="email" required defaultValue={signUpDefaultValues.email} />
                </div>
                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id='password' name="password" type='password' placeholder='Password' autoComplete="password" required defaultValue={signUpDefaultValues.password} />
                </div>
                <div>
                    <Label htmlFor="password">Confirm Password</Label>
                    <Input id='confirmPassword' name="confirmPassword" type='password' placeholder='ConfirmPassword' autoComplete="confirmPassword" required defaultValue={signUpDefaultValues.password} />
                </div>
                <div>
                    <SignUpButton />
                </div>
                {data && !data.success && (<div className="text-center text-destructive">{data.message}</div>)}
                <div className="text-small text-center text-muted-foreground">
                    Already have an account? <Link href="/sign-" target="_self" className="link">Sign in</Link>
                </div>
            </div>
        </form>
    );
}

export default SignUpForm;