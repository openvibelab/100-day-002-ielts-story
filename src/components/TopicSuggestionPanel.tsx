"use client";

import { useMemo, useState } from "react";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { CoreStory, SuggestedTopic } from "@/lib/types";
import { hasUserApiKey, getUserApiKey, getUserProvider } from "@/lib/ai";
import { useLang } from "@/lib/LangContext";
import { catLabel } from "@/lib/i18n";

interface TopicSuggestionPanelProps {
  story?: CoreStory;
  selectedTopicIds: Set<string>;
  onToggleTopic: (topicId: string) => void;
  disabled?: boolean;
}

export function TopicSuggestionPanel({
  story,
  selectedTopicIds,
  onToggleTopic,
  disabled = false,
}: TopicSuggestionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestedTopic[]>([]);
  const { locale } = useLang();

  const labels = useMemo(
    () => ({
      title: locale === "zh" ? "AI 初步联想话题" : "AI topic suggestions",
      desc:
        locale === "zh"
          ? "先让 AI 根据你的核心故事推荐一批最可能串得上的题，再由你手动筛选确认。"
          : "Let AI suggest likely matching topics first, then manually confirm the ones you really want.",
      button: locale === "zh" ? "让 AI 推荐" : "Suggest topics",
      buttonLoading: locale === "zh" ? "联想中..." : "Thinking...",
      applyAll: locale === "zh" ? "选中全部建议" : "Select all suggestions",
      selected: locale === "zh" ? "已选" : "Selected",
      add: locale === "zh" ? "加入待生成" : "Add",
      noStory:
        locale === "zh"
          ? "先选一个故事，AI 才能开始联想相关话题。"
          : "Choose a story first so AI can suggest related topics.",
    }),
    [locale]
  );

  async function handleSuggest() {
    if (!story || disabled) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const body: Record<string, string | number> = {
        story: story.content,
        storyCategory: story.category,
        limit: 8,
      };

      if (hasUserApiKey()) {
        body.userApiKey = getUserApiKey();
        body.userProvider = getUserProvider();
      }

      const res = await fetch("/api/suggest-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to suggest topics");
      }

      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
    } catch (suggestError) {
      setError(suggestError instanceof Error ? suggestError.message : "Failed to suggest topics");
    } finally {
      setLoading(false);
    }
  }

  function handleApplyAll() {
    for (const suggestion of suggestions) {
      if (!selectedTopicIds.has(suggestion.id)) {
        onToggleTopic(suggestion.id);
      }
    }
  }

  return (
    <div className="card mt-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-warm-text">{labels.title}</h3>
          <p className="mt-1 text-xs leading-6 text-gray-500">
            {story ? labels.desc : labels.noStory}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.length > 0 && (
            <button
              type="button"
              onClick={handleApplyAll}
              disabled={disabled || loading}
              className="btn-ghost text-xs"
            >
              <CheckCircle2 size={14} />
              {labels.applyAll}
            </button>
          )}
          <button
            type="button"
            onClick={handleSuggest}
            disabled={!story || disabled || loading}
            className="btn-accent text-xs"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? labels.buttonLoading : labels.button}
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      {suggestions.length > 0 && (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {suggestions.map((suggestion) => {
            const isSelected = selectedTopicIds.has(suggestion.id);
            return (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => onToggleTopic(suggestion.id)}
                disabled={disabled}
                className={`rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-amber-400 bg-amber-500/10"
                    : "border-dark-border bg-dark-card hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`tag-${suggestion.category}`}>
                    {catLabel(suggestion.category, locale)}
                  </span>
                  <span className="text-sm font-medium text-warm-text">{suggestion.title}</span>
                </div>
                <p className="mt-2 text-xs leading-6 text-gray-500">{suggestion.reason}</p>
                <p className="mt-3 text-[11px] font-medium text-amber-400">
                  {isSelected ? labels.selected : labels.add}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
