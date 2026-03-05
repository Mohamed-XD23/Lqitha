import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Lqitha
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/browse" className="text-gray-600 hover:text-black">
            Browse
          </Link>

          {session?.user && (
            <Link href="/items/new" className="text-gray-600 hover:text-black">
              Post Item
            </Link>
          )}

          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user.name}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-black"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}