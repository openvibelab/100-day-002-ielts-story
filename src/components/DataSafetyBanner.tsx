"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { ts } from "@/lib/i18n";

const DISMISSED_KEY = "isa_data_banner_dismissed";

export function DataSafetyBanner() {
  const [show, setShow] = useState(false);
  const { locale } = useLang();

  useEffect(() => {
    if (!localStorage.getItem(DISMISSED_KEY)) {
      setShow(true);
    }
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="no-print border-b border-amber-500/20 bg-amber-500/5 px-4 py-2.5">
      <div className="mx-auto flex max-w-6xl items-center gap-3 text-xs text-amber-400">
        <AlertTriangle size={14} className="shrink-0" />
        <p>
          {ts("dataBanner", locale)}{" "}
          <Link href="/corpus" className="underline hover:text-amber-300">
            {ts("dataBannerExport", locale)}
          </Link>{" "}
        </p>
        <button
          onClick={handleDismiss}
          className="ml-auto shrink-0 rounded p-1 hover:bg-amber-500/10"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
