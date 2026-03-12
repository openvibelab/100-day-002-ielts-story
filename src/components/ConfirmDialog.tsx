"use client";

import { AlertTriangle } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import { ts } from "@/lib/i18n";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { locale } = useLang();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card mx-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              danger ? "bg-red-500/10" : "bg-amber-500/10"
            }`}
          >
            <AlertTriangle size={18} className={danger ? "text-red-400" : "text-amber-400"} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-warm-text">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-warm-secondary">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="btn-ghost text-xs">
            {ts("cancel", locale)}
          </button>
          <button
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold transition-all ${
              danger
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-amber-500 text-black hover:shadow-[0_0_15px_rgba(232,164,74,0.4)]"
            }`}
          >
            {confirmLabel || ts("confirm", locale)}
          </button>
        </div>
      </div>
    </div>
  );
}
