"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { StoryCategory, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import { IELTS_TOPICS } from "@/data/topics";
import { getAdaptedCountByTopic } from "@/lib/store";
import Link from "next/link";

const CATEGORIES: StoryCategory[] = ["person", "event", "object", "place"];

export default function TopicsPage() {
  const [filter, setFilter] = useState<StoryCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adaptedCounts, setAdaptedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const counts: Record<string, number> = {};
    IELTS_TOPICS.forEach((t) => {
      counts[t.id] = getAdaptedCountByTopic(t.id);
    });
    setAdaptedCounts(counts);
  }, []);

  const filtered = filter === "all" ? IELTS_TOPICS : IELTS_TOPICS.filter((t) => t.category === filter);

  const totalAdapted = Object.values(adaptedCounts).filter((c) => c > 0).length;

  return (
    <div className="page-container">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">IELTS Speaking Topics</h1>
          <p className="mt-2 text-sm text-gray-500">
            {IELTS_TOPICS.length} topics · {totalAdapted} covered
          </p>
        </div>
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
          All ({IELTS_TOPICS.length})
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
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((topic) => {
          const isExpanded = expandedId === topic.id;
          const hasAdapted = (adaptedCounts[topic.id] || 0) > 0;

          return (
            <div key={topic.id} className="card">
              <button
                onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  {hasAdapted && <CheckCircle2 size={16} className="shrink-0 text-neon-green" />}
                  <span className={CATEGORY_COLORS[topic.category]}>{CATEGORY_LABELS[topic.category]}</span>
                  <span className="text-sm font-medium text-gray-200">{topic.title}</span>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
              </button>

              {isExpanded && (
                <div className="mt-4 border-t border-dark-border pt-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-400">{topic.cue_card}</p>
                  <div className="mt-4">
                    <Link href={`/adapt?topic=${topic.id}`} className="btn-neon text-xs">
                      Adapt a story to this topic
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
