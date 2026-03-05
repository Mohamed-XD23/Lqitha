import Link from "next/link";

export default function Navbar() {
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
          <Link href="/items/new" className="text-gray-600 hover:text-black">
            Post Item
          </Link>
          <Link
            href="/api/auth/signin"
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}