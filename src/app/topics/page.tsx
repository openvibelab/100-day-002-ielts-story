"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, Sparkles } from "lucide-react";
import { CoreStory, StoryCategory, CATEGORY_COLORS } from "@/lib/types";
import { IELTS_TOPICS } from "@/data/topics";
import { getAdaptedCountByTopic, getStories } from "@/lib/store";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { ts, catLabel } from "@/lib/i18n";

const CATEGORIES: StoryCategory[] = ["person", "event", "object", "place"];

const SOURCE_LABELS: Record<string, { label: string; className: string }> = {
  "2026 Jan-Apr New": { label: "New", className: "tag-source-new" },
  "2026 Jan-Apr": { label: "2026", className: "tag-source-2026" },
  "2025-2026": { label: "2025", className: "tag-source-2026" },
  classic: { label: "Classic", className: "tag-source-classic" },
};

export default function TopicsPage() {
  const [filter, setFilter] = useState<StoryCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adaptedCounts, setAdaptedCounts] = useState<Record<string, number>>({});
  const [stories, setStories] = useState<CoreStory[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLang();

  useEffect(() => {
    const counts: Record<string, number> = {};
    IELTS_TOPICS.forEach((t) => {
      counts[t.id] = getAdaptedCountByTopic(t.id);
    });
    setAdaptedCounts(counts);
    setStories(getStories());
    setLoading(false);
  }, []);

  const filtered = filter === "all" ? IELTS_TOPICS : IELTS_TOPICS.filter((t) => t.category === filter);

  const totalAdapted = Object.values(adaptedCounts).filter((c) => c > 0).length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-48" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{ts("topicsTitle", locale)}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {IELTS_TOPICS.length} {ts("progressTopics", locale)} · {totalAdapted} {ts("topicsCovered", locale)} ({Math.round((totalAdapted / IELTS_TOPICS.length) * 100)}%)
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-dark-surface">
        <div
          className="h-full rounded-full bg-neon-blue transition-all duration-500"
          style={{
            width: `${(totalAdapted / IELTS_TOPICS.length) * 100}%`,
            boxShadow: "0 0 10px rgba(0, 212, 255, 0.5)",
          }}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "all"
              ? "border-neon-blue bg-neon-blue/10 text-neon-blue"
              : "border-dark-border text-gray-500 hover:text-gray-300"
          }`}
        >
          {ts("catAll", locale)} ({IELTS_TOPICS.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = IELTS_TOPICS.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === cat
                  ? "border-neon-blue bg-neon-blue/10 text-neon-blue"
                  : "border-dark-border text-gray-500 hover:text-gray-300"
              }`}
            >
              {catLabel(cat, locale)} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((topic) => {
          const isExpanded = expandedId === topic.id;
          const hasAdapted = (adaptedCounts[topic.id] || 0) > 0;
          const sourceInfo = topic.source ? SOURCE_LABELS[topic.source] : null;

          return (
            <div key={topic.id} className="card">
              <button
                onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {hasAdapted && <CheckCircle2 size={16} className="shrink-0 text-neon-green" />}
                  <span className={CATEGORY_COLORS[topic.category]}>{catLabel(topic.category, locale)}</span>
                  <span className="min-w-0 truncate text-sm font-medium text-gray-200">{topic.title}</span>
                  {sourceInfo && (
                    <span className={sourceInfo.className}>{sourceInfo.label}</span>
                  )}
                </div>
                {isExpanded ? <ChevronUp size={16} className="shrink-0 text-gray-500" /> : <ChevronDown size={16} className="shrink-0 text-gray-500" />}
              </button>

              {isExpanded && (
                <div className="mt-4 border-t border-dark-border pt-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-400">{topic.cue_card}</p>

                  {stories.length > 0 ? (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-medium text-gray-500">{ts("topicsQuickAdapt", locale)}</p>
                      <div className="flex flex-wrap gap-2">
                        {stories.map((s) => (
                          <Link
                            key={s.id}
                            href={`/adapt?topic=${topic.id}&story=${s.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-dark-border bg-dark-surface px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-neon-blue hover:text-neon-blue"
                          >
                            <Sparkles size={10} />
                            {s.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Link href="/stories" className="btn-neon text-xs">
                        {ts("topicsAddStoryFirst", locale)}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
