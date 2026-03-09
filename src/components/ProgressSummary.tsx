"use client";

import { useEffect, useState } from "react";
import { getStories, getAdaptedStories } from "@/lib/store";
import { IELTS_TOPICS } from "@/data/topics";
import { useLang } from "@/lib/LangContext";
import { ts } from "@/lib/i18n";

export function ProgressSummary() {
  const [stats, setStats] = useState({ stories: 0, adapted: 0, topicsCovered: 0 });
  const { locale } = useLang();

  useEffect(() => {
    const stories = getStories();
    const adapted = getAdaptedStories();
    const coveredTopics = new Set(adapted.map((a) => a.topic_id));
    setStats({
      stories: stories.length,
      adapted: adapted.length,
      topicsCovered: coveredTopics.size,
    });
  }, []);

  if (stats.stories === 0 && stats.adapted === 0) return null;

  const coveragePercent = Math.round((stats.topicsCovered / IELTS_TOPICS.length) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-100">{stats.stories}</p>
              <p className="text-xs text-gray-500">{ts("progressStories", locale)}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{stats.adapted}</p>
              <p className="text-xs text-gray-500">{ts("progressAdaptations", locale)}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-neon-blue">{stats.topicsCovered}</p>
              <p className="text-xs text-gray-500">/ {IELTS_TOPICS.length} {ts("progressTopics", locale)}</p>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-gray-300">{coveragePercent}% {ts("progressCovered", locale)}</p>
            <p className="text-xs text-gray-500">
              {IELTS_TOPICS.length - stats.topicsCovered} {ts("progressRemaining", locale)}
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-dark-surface">
          <div
            className="h-full rounded-full bg-neon-blue transition-all duration-700"
            style={{
              width: `${coveragePercent}%`,
              boxShadow: "0 0 10px rgba(0, 212, 255, 0.5)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
