"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Copy, Check, Loader2, Settings, CheckCircle2 } from "lucide-react";
import { CoreStory, CATEGORY_COLORS } from "@/lib/types";
import { IELTS_TOPICS } from "@/data/topics";
import { getStories, getAdaptedStory, saveAdaptedStory, getAdaptedStories, getAdaptedCountByStory, updateAdaptedContent } from "@/lib/store";
import { hasUserApiKey, getUserApiKey, getUserProvider } from "@/lib/ai";
import { toAdaptedResult } from "@/lib/adapted-result";
import { ApiKeySetup, ApiKeyBadge } from "@/components/ApiKeySetup";
import { TopicCombobox } from "@/components/TopicCombobox";
import { TopicSuggestionPanel } from "@/components/TopicSuggestionPanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SpeakButton } from "@/components/SpeakButton";
import { EditableContent } from "@/components/EditableContent";
import { useLang } from "@/lib/LangContext";
import { ts, catLabel } from "@/lib/i18n";

export function AdaptContent() {
  const searchParams = useSearchParams();
  const preselectedTopic = searchParams.get("topic") || "";
  const preselectedStory = searchParams.get("story") || "";

  const [stories, setStories] = useState<CoreStory[]>([]);
  const [selectedStory, setSelectedStory] = useState(preselectedStory);
  const [selectedTopic, setSelectedTopic] = useState(preselectedTopic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ adapted_content: string; tips: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [adaptedTopicIds, setAdaptedTopicIds] = useState<Set<string>>(new Set());
  const { locale } = useLang();

  useEffect(() => {
    setStories(getStories());
    const adapted = getAdaptedStories();
    setAdaptedTopicIds(new Set(adapted.map((a) => a.topic_id)));
  }, []);

  useEffect(() => {
    if (selectedStory && selectedTopic) {
      const existing = getAdaptedStory(selectedStory, selectedTopic);
      if (existing) {
        setResult(toAdaptedResult(existing));
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [selectedStory, selectedTopic]);

  const story = stories.find((s) => s.id === selectedStory);
  const topic = IELTS_TOPICS.find((t) => t.id === selectedTopic);

  async function doGenerate() {
    if (!story || !topic) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const body: Record<string, string> = {
        story: story.content,
        topic: topic.title,
        cue_card: topic.cue_card,
      };

      if (hasUserApiKey()) {
        body.userApiKey = getUserApiKey();
        body.userProvider = getUserProvider();
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.code === "QUOTA_EXCEEDED") {
          setError(ts("adaptQuotaError", locale));
          setShowApiSetup(true);
          return;
        }
        if (data.code === "INVALID_KEY") {
          setError(ts("adaptInvalidKey", locale));
          setShowApiSetup(true);
          return;
        }
        throw new Error(data.error || "Failed to generate");
      }

      const data = toAdaptedResult(await res.json());
      setResult(data);

      saveAdaptedStory({
        story_id: story.id,
        topic_id: topic.id,
        adapted_content: data.adapted_content,
        tips: data.tips,
      });

      setAdaptedTopicIds((prev) => { const next = new Set(Array.from(prev)); next.add(topic.id); return next; });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleGenerate() {
    if (result) {
      setShowRegenConfirm(true);
      return;
    }
    doGenerate();
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.adapted_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-gray-100">{ts("adaptTitle", locale)}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {ts("adaptDesc", locale)}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-medium text-gray-400">{ts("adaptStep1", locale)}</p>
          {stories.length === 0 ? (
            <div className="card py-10 text-center">
              <p className="text-sm text-gray-500">{ts("adaptNoStories", locale)}</p>
              <a href="/stories" className="btn-neon mt-4 text-xs">{ts("adaptAddFirst", locale)}</a>
            </div>
          ) : (
            <div className="space-y-2">
              {stories.map((s) => {
                const adaptedCount = getAdaptedCountByStory(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStory(s.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      selectedStory === s.id
                        ? "border-neon-blue bg-neon-blue/5"
                        : "border-dark-border bg-dark-card hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={CATEGORY_COLORS[s.category]}>{catLabel(s.category, locale)}</span>
                      <span className="text-sm font-medium text-gray-200">{s.title}</span>
                      {adaptedCount > 0 && (
                        <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                          <CheckCircle2 size={12} className="text-green-500/50" />
                          {adaptedCount}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-gray-500">{s.content}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-xs font-medium text-gray-400">{ts("adaptStep2", locale)}</p>
          <TopicCombobox
            topics={IELTS_TOPICS}
            value={selectedTopic}
            onChange={setSelectedTopic}
            adaptedTopicIds={adaptedTopicIds}
          />
          <TopicSuggestionPanel
            story={story}
            selectedTopicIds={new Set(selectedTopic ? [selectedTopic] : [])}
            onToggleTopic={(topicId) => setSelectedTopic(topicId === selectedTopic ? "" : topicId)}
            disabled={loading}
          />

          {topic && (
            <div className="card mt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-400">{ts("adaptCueCard", locale)}</p>
                {selectedStory && getAdaptedStory(selectedStory, selectedTopic) && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle2 size={12} />
                    {ts("adaptAlreadyAdapted", locale)}
                  </span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-300">{topic.cue_card}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          className="btn-neon-solid"
          disabled={!selectedStory || !selectedTopic || loading}
          onClick={handleGenerate}
          title={!selectedStory || !selectedTopic ? ts("adaptSelectHint", locale) : undefined}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? ts("adaptGenerating", locale) : result ? ts("adaptRegenerate", locale) : ts("adaptGenerate", locale)}
        </button>
        <button
          className="btn-ghost text-xs"
          onClick={() => setShowApiSetup(!showApiSetup)}
        >
          <Settings size={14} />
          {ts("adaptApiKey", locale)}
        </button>
        <ApiKeyBadge />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <ApiKeySetup show={showApiSetup} />

      {result && (
        <div className="mt-8 space-y-5">
          <div className="card">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-gray-200">{ts("adaptResult", locale)}</h3>
              <div className="flex gap-1.5">
                <SpeakButton text={result.adapted_content} />
                <button onClick={handleCopy} className="btn-ghost !px-2 !py-1 text-xs" aria-label={ts("copy", locale)}>
                  {copied ? <Check size={12} className="text-neon-green" /> : <Copy size={12} />}
                  {copied ? ts("copied", locale) : ts("copy", locale)}
                </button>
              </div>
            </div>
            <EditableContent
              content={result.adapted_content}
              onSave={(newContent) => {
                setResult({ ...result, adapted_content: newContent });
                if (selectedStory && selectedTopic) {
                  const existing = getAdaptedStory(selectedStory, selectedTopic);
                  if (existing) updateAdaptedContent(existing.id, newContent);
                }
              }}
              className="mt-4"
            />
            <p className="mt-3 text-xs text-gray-600">
              {result.adapted_content.split(/\s+/).length} {ts("words", locale)}
            </p>
          </div>

          {result.tips && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-200">{ts("adaptTips", locale)}</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-400">{result.tips}</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={showRegenConfirm}
        title={ts("adaptRegenTitle", locale)}
        message={ts("adaptRegenMsg", locale)}
        confirmLabel={ts("adaptRegenerate", locale)}
        onConfirm={() => { setShowRegenConfirm(false); doGenerate(); }}
        onCancel={() => setShowRegenConfirm(false)}
      />
    </div>
  );
}
