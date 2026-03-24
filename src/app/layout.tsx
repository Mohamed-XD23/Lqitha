import type { Metadata } from "next";
import { Fraunces, Outfit, Cairo } from "next/font/google";
import { ChatProvider } from "@/context/ChatContext";
import ChatSidebar from "@/components/chat/ChatSidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { getLocale } from "@/lib/dictionary";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-fraunces",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Lqitha",
  description: "Lost & Found Platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html dir={dir} lang={locale}>
      <body
        className={`${outfit.variable} ${fraunces.variable} ${cairo.variable} flex min-h-screen flex-col`}
        style={{ fontFamily: "var(--font-interface), sans-serif" }}
      >
        <ChatProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatSidebar />
          <Toaster position="bottom-right" richColors />
        </ChatProvider>
      </body>
    </html>
  );
}
