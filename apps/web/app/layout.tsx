import type { Metadata } from "next";
import "./globals.css";
import { Geist, Cormorant_Garamond } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Time",
  description: "Personal time tracking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable, cormorant.variable)}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
