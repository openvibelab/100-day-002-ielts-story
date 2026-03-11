"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/LangContext";

const TABS = [
  { href: "/adapt", label: { en: "Single adapt", zh: "单条改编" } },
  { href: "/batch", label: { en: "Batch adapt", zh: "批量改编" } },
];

export function AdaptWorkspaceTabs() {
  const pathname = usePathname();
  const { locale } = useLang();

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.24em] text-gray-500">
        {locale === "zh" ? "改编工作台" : "Adapt workspace"}
      </span>
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-neon-blue bg-neon-blue/10 text-neon-blue"
                : "border-dark-border text-gray-400 hover:border-gray-500 hover:text-gray-200"
            }`}
          >
            {tab.label[locale]}
          </Link>
        );
      })}
    </div>
  );
}
