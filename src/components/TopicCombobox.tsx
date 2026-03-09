"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X, CheckCircle2 } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_COLORS, StoryCategory } from "@/lib/types";
import { IELTSTopic } from "@/lib/types";

const CATEGORIES: StoryCategory[] = ["person", "event", "object", "place"];
const SOURCE_LABELS: Record<string, string> = {
  "2026 Jan-Apr New": "New",
  "2026 Jan-Apr": "2026",
  "2025-2026": "2025",
  classic: "Classic",
};

interface TopicComboboxProps {
  topics: IELTSTopic[];
  value: string;
  onChange: (topicId: string) => void;
  adaptedTopicIds?: Set<string>;
}

export function TopicCombobox({ topics, value, onChange, adaptedTopicIds }: TopicComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<StoryCategory | "all">("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedTopic = topics.find((t) => t.id === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = topics.filter((t) => {
    const matchesCat = filterCat === "all" || t.category === filterCat;
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.cue_card.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  function handleSelect(topicId: string) {
    onChange(topicId);
    setOpen(false);
    setSearch("");
  }

  function handleClear() {
    onChange("");
    setSearch("");
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="input-dark flex items-center justify-between gap-2 text-left"
      >
        {selectedTopic ? (
          <div className="flex min-w-0 items-center gap-2">
            <span className={CATEGORY_COLORS[selectedTopic.category] + " !text-[10px] !px-1.5 !py-0.5"}>
              {CATEGORY_LABELS[selectedTopic.category]}
            </span>
            <span className="truncate text-sm text-gray-200">{selectedTopic.title}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-600">Select a topic...</span>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {value && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="rounded p-0.5 hover:bg-dark-surface"
              aria-label="Clear topic selection"
            >
              <X size={14} className="text-gray-500" />
            </span>
          )}
          <ChevronDown size={14} className="text-gray-500" />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-dark-border bg-dark-card shadow-xl">
          {/* Search */}
          <div className="border-b border-dark-border p-2">
            <div className="flex items-center gap-2 rounded-lg bg-dark-surface px-3 py-2">
              <Search size={14} className="shrink-0 text-gray-500" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full bg-transparent text-sm text-gray-200 outline-none placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1 border-b border-dark-border px-2 py-2">
            <button
              onClick={() => setFilterCat("all")}
              className={`rounded px-2 py-1 text-[10px] font-medium transition-colors ${
                filterCat === "all" ? "bg-neon-blue/10 text-neon-blue" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`rounded px-2 py-1 text-[10px] font-medium transition-colors ${
                  filterCat === cat ? "bg-neon-blue/10 text-neon-blue" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Options */}
          <div className="max-h-[280px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-gray-500">No topics found</p>
            ) : (
              filtered.map((t) => {
                const isSelected = t.id === value;
                const isAdapted = adaptedTopicIds?.has(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t.id)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-neon-blue/10 text-neon-blue"
                        : "text-gray-300 hover:bg-dark-surface"
                    }`}
                  >
                    <span className={CATEGORY_COLORS[t.category] + " !text-[10px] !px-1.5 !py-0.5"}>
                      {CATEGORY_LABELS[t.category]}
                    </span>
                    <span className="min-w-0 truncate">{t.title}</span>
                    {t.source && SOURCE_LABELS[t.source] && (
                      <span className="ml-auto shrink-0 rounded bg-dark-surface px-1.5 py-0.5 text-[10px] text-gray-500">
                        {SOURCE_LABELS[t.source]}
                      </span>
                    )}
                    {isAdapted && (
                      <CheckCircle2 size={12} className="shrink-0 text-green-500/50" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
