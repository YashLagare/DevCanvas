import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import {
  ClerkProvider
} from "@clerk/nextjs";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DevCanvas - Your Coding Workspace",
  description: "DevCanvas - Your Coding Workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white`}
      >
        <ClerkProvider>
          <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}

