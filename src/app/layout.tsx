import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Trade Tesla Tomorrow | Official Tesla Ecosystem Marketplace",
  description: "Buy and sell Tesla vehicles, energy systems, and robotics on the most advanced fintech marketplace. Powered by the Tesla Ecosystem.",
  keywords: ["Tesla", "Trade", "Cybertruck", "Powerwall", "Optimus", "Marketplace"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} antialiased min-h-full`}>
        {children}
      </body>
    </html>
  );
}
