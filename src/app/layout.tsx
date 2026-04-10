import React from "react";
import type { Metadata } from "next";
import { Fraunces, Outfit, Cairo } from "next/font/google";
import { ChatProvider } from "@/context/ChatContext";
import ChatSidebar from "@/components/chat/ChatSidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { getLocale } from "@/lib/dictionary";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getDictionary } from "@/lib/dictionary";
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
  const dict = await getDictionary();
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const fontDisplay =
    locale === "ar" ? "var(--font-cairo)" : "var(--font-fraunces)";
  const fontInterface =
    locale === "ar" ? "var(--font-cairo)" : "var(--font-outfit)";

  return (
    <html dir={dir} lang={locale}>
      <body
        className={`${outfit.variable} ${fraunces.variable} ${cairo.variable} flex min-h-screen flex-col`}
        style={
          {
            fontFamily: `${fontInterface}, sans-serif`,
            "--font-display": fontDisplay,
            "--font-interface": fontInterface,
            "--font-display-dynamic": fontDisplay,
            "--font-interface-dynamic": fontInterface,
          } as React.CSSProperties
        }
      >
        <ChatProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            themes={["dark", ]}
            enableSystem={false}
            disableTransitionOnChange
          >
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatSidebar dict={dict} />
            <Toaster
              position="bottom-right"
              closeButton
              visibleToasts={4}
              gap={12}
              offset={20}
              toastOptions={{
                duration: 4000,
                unstyled: true,
                classNames: {
                  toast: "app-toast",
                  title: "app-toast__title",
                  description: "app-toast__description",
                  icon: "app-toast__icon",
                  content: "app-toast__content",
                  success: "app-toast--success",
                  error: "app-toast--error",
                  info: "app-toast--info",
                  warning: "app-toast--warning",
                  loading: "app-toast--loading",
                  closeButton: "app-toast__close",
                  actionButton: "app-toast__action",
                  cancelButton: "app-toast__cancel",
                },
              }}
           />
          </ThemeProvider>
        </ChatProvider>
      </body>
    </html>
  );
}
