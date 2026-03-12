import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { NavLinks } from "@/components/NavLinks";
import { DataSafetyBanner } from "@/components/DataSafetyBanner";
import { LangProvider } from "@/lib/LangContext";
import { LangToggle } from "@/components/LangToggle";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;0,7..72,700;1,7..72,400&family=Instrument+Sans:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-['Instrument_Sans','Noto_Sans_SC',sans-serif] antialiased">
        <LangProvider>
        <header className="no-print sticky top-0 z-50 border-b border-dark-border" style={{ background: 'rgba(28, 25, 21, 0.92)', backdropFilter: 'blur(12px)' }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold" style={{ background: '#e8a44a', color: '#1c1915' }}>
                IS
              </span>
              <span className="hidden text-sm font-semibold sm:inline" style={{ color: '#ede8e0' }}>IELTS Story Adapter</span>
            </Link>
            <div className="flex items-center gap-2">
              <NavLinks />
              <LangToggle />
            </div>
          </div>
        </header>
        <DataSafetyBanner />
        <main className="min-h-[calc(100vh-130px)]">{children}</main>
        <footer className="no-print border-t border-dark-border py-6 text-center text-sm" style={{ color: '#7a6f5f' }}>
          <a href="https://openvibelab.com" target="_blank" className="transition-colors hover:text-amber-400">
            OpenVibeLab
          </a>{" "}
          · Day 002
        </footer>
        </LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
