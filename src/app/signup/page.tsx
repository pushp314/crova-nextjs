import { SignupForm } from "@/components/auth/signup-form";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Sign Up - NOVA",
    description: "Create your NOVA account.",
};

export default function SignupPage() {
    return (
        <div className="container flex min-h-[calc(100vh-20rem)] flex-col items-center justify-center py-12">
            <div className="mx-auto w-full max-w-sm">
                <h1 className="mb-6 text-center text-3xl font-bold">
                    Create an Account
                </h1>
                <SignupForm />
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
