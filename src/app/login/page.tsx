"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// export const metadata: Metadata = { // Metadata can't be used in a client component
//     title: "Login - NOVA",
//     description: "Login to your NOVA account.",
// };

export default function LoginPage() {
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            toast.success("Email verified!", {
                description: "You can now log in to your account.",
            });
        }
    }, [searchParams]);

    return (
        <div className="container flex min-h-[calc(100vh-20rem)] flex-col items-center justify-center py-12">
            <Card className="mx-auto w-full max-w-sm">
                 <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">
                        Login
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-medium text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
