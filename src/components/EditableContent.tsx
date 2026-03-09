"use client";

import { useState } from "react";
import { Edit3, Save, X } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import { ts } from "@/lib/i18n";

interface EditableContentProps {
  content: string;
  onSave: (newContent: string) => void;
  className?: string;
}

export function EditableContent({ content, onSave, className = "" }: EditableContentProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const { locale } = useLang();

  function handleEdit() {
    setDraft(content);
    setEditing(true);
  }

  function handleSave() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== content) {
      onSave(trimmed);
    }
    setEditing(false);
  }

  function handleCancel() {
    setDraft(content);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="mt-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="textarea-dark min-h-[200px] text-sm leading-7"
          autoFocus
        />
        <div className="mt-2 flex gap-2">
          <button onClick={handleSave} className="btn-neon text-xs" disabled={!draft.trim()}>
            <Save size={12} />
            {ts("save", locale)}
          </button>
          <button onClick={handleCancel} className="btn-ghost text-xs">
            <X size={12} />
            {ts("cancel", locale)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <p className={`whitespace-pre-line text-sm leading-7 text-gray-300 ${className}`}>
        {content}
      </p>
      <button
        onClick={handleEdit}
        className="absolute -right-1 -top-1 rounded-lg p-1.5 text-gray-600 opacity-0 transition-all hover:bg-dark-surface hover:text-gray-300 group-hover:opacity-100"
        aria-label={ts("edit", locale)}
        title={ts("edit", locale)}
      >
        <Edit3 size={12} />
      </button>
    </div>
  );
}
