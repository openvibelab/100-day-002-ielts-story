"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { getStories, getAdaptedStories } from "@/lib/store";

const links = [
  { href: "/stories", label: "Stories" },
  { href: "/topics", label: "Topics" },
  { href: "/adapt", label: "Adapt" },
  { href: "/batch", label: "Batch" },
  { href: "/mind-map", label: "Mind Map" },
  { href: "/corpus", label: "Corpus" },
];

export function NavLinks() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [counts, setCounts] = useState({ stories: 0, adapted: 0 });

  useEffect(() => {
    setCounts({
      stories: getStories().length,
      adapted: getAdaptedStories().length,
    });
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function getBadge(href: string): string | null {
    if (href === "/stories" && counts.stories > 0) return String(counts.stories);
    if (href === "/corpus" && counts.adapted > 0) return String(counts.adapted);
    return null;
  }

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const badge = getBadge(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-neon-blue/10 text-neon-blue"
                  : "text-gray-400 hover:bg-dark-card hover:text-gray-200"
              }`}
            >
              {link.label}
              {badge && (
                <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-dark-surface px-1 text-[10px] text-gray-500">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-dark-card hover:text-gray-200 md:hidden"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 top-[65px] z-50 bg-dark-bg/95 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const badge = getBadge(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-base transition-colors ${
                    isActive
                      ? "bg-neon-blue/10 text-neon-blue"
                      : "text-gray-300 hover:bg-dark-card"
                  }`}
                >
                  <span>{link.label}</span>
                  {badge && (
                    <span className="rounded-full bg-dark-surface px-2 py-0.5 text-xs text-gray-500">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
