
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Login - NOVA",
    description: "Login to your NOVA account.",
};

function LoginPageContent() {
    return (
        <div className="flex min-h-[calc(100vh-20rem)] flex-col items-center justify-center py-12">
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

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    );
}
