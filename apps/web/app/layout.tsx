import type { Metadata } from "next";
import "./globals.css";
import { Geist, Cormorant_Garamond } from "next/font/google";

import { AppProviders } from "@/components/providers";
import { auth0 } from "@/lib/auth0";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();

  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable, cormorant.variable)}
    >
      <body className="min-h-screen">
        <AppProviders user={session?.user}>{children}</AppProviders>
      </body>
    </html>
  );
}
