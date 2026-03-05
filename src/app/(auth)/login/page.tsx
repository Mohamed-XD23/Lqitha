"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        const result = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password.");
            setLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md rounded-xl border p-8 shadow-sm">
                <h1 className="mb-6 text-2xl font-bold">Sign in</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Email</label>
                        <input name="email" type="email" required
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Password</label>
                        <input name="password" type="password" required
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" disabled={loading}
                        className="rounded-md bg-black py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className="my-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                <button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="w-full rounded-md border py-2 text-sm font-medium hover:bg-gray-50">
                    Continue with Google
                </button>

                <p className="mt-4 text-center text-sm text-gray-500">Don't have an account?{" "}
                    <Link href="/register" className="font-medium underline">Register</Link>
                </p>
            </div>
        </div>
    );
}