import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NearBuy - Buy & Sell Nearby",
  description: "Location-based marketplace for buying and selling products nearby",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
