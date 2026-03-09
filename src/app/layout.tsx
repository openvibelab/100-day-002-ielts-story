import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { NavLinks } from "@/components/NavLinks";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "IELTS Story Adapter — Reuse Your Stories for Any Topic",
  description: "Use AI to adapt your personal core stories to fit any IELTS Speaking Part 2 topic. Practice smarter, not harder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} font-[family-name:var(--font-geist-sans)] antialiased`}>
        <header className="sticky top-0 z-50 border-b border-dark-border bg-dark-bg/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon-blue text-sm font-bold text-black">
                IS
              </span>
              <span className="text-sm font-semibold text-gray-200">IELTS Story Adapter</span>
            </Link>
            <NavLinks />
          </div>
        </header>
        <main className="min-h-[calc(100vh-130px)]">{children}</main>
        <footer className="border-t border-dark-border py-6 text-center text-sm text-gray-600">
          <a href="https://openvibelab.com" target="_blank" className="transition-colors hover:text-neon-blue">
            OpenVibeLab
          </a>{" "}
          · Day 002
        </footer>
      </body>
    </html>
  );
}
