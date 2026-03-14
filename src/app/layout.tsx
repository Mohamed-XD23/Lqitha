import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { ChatProvider } from "@/context/ChatContext";
import ChatSidebar from "@/components/chat/ChatSidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "sonner";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-cormorant",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Lqitha",
  description: "Lost & Found Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html dir="rtl" lang="ar">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body
        className={`${outfit.variable} ${cormorant.variable} flex min-h-screen flex-col`}
        style={{ fontFamily: "var(--font-outfit), sans-serif" }}
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
