"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth.actions";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await registerUser(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl border p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Create an account</h1>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input name="name" type="text" required
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" type="email" required
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input name="password" type="password" required minLength={6}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading}
            className="rounded-md bg-black py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}