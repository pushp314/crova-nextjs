import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Login - NOVA",
    description: "Login to your NOVA account.",
};

export default function LoginPage() {
    return (
        <div className="container flex min-h-[calc(100vh-20rem)] flex-col items-center justify-center py-12">
            <div className="mx-auto w-full max-w-sm">
                <h1 className="mb-6 text-center text-3xl font-bold">
                    Login
                </h1>
                <LoginForm />
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-medium text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
