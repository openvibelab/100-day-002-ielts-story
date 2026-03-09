"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/stories", label: "My Stories" },
  { href: "/topics", label: "Topics" },
  { href: "/adapt", label: "Adapt" },
  { href: "/mind-map", label: "Mind Map" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
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
          </Link>
        );
      })}
    </nav>
  );
}
