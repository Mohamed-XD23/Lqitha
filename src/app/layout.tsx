import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ChatProvider } from "@/context/ChatContext";
import ChatSidebar from "@/components/chat/ChatSidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "sonner";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={`${geist.className} flex min-h-screen flex-col`}>
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
