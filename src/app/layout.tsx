import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileBottomNav from "../components/MobileBottomNav";
import SessionClientProvider from "../components/SessionClientProvider";
import SessionDebug from "../components/SessionDebug";
import { CartProvider } from "../contexts/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const generateViewport = () => 'width=device-width, initial-scale=1';

export const metadata: Metadata = {
  title: "DukanBaz - Pakistan B2B Wholesale Marketplace",
  description: "Pakistan's leading B2B wholesale marketplace. Connect with verified suppliers and buyers across Pakistan. Find quality products at wholesale prices.",
  keywords: ["wholesale", "B2B", "Pakistan", "suppliers", "buyers", "bulk trading", "business marketplace"],
  authors: [{ name: "DukanBaz" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-16 lg:pb-0`}
        suppressHydrationWarning={true}
      >
        <SessionClientProvider>
          <CartProvider>
            {children}
            <MobileBottomNav />
            <SessionDebug />
          </CartProvider>
        </SessionClientProvider>
      </body>
    </html>
  );
}
