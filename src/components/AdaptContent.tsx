"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { CoreStory, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import { IELTS_TOPICS } from "@/data/topics";
import { getStories, getAdaptedStory, saveAdaptedStory } from "@/lib/store";

export function AdaptContent() {
  const searchParams = useSearchParams();
  const preselectedTopic = searchParams.get("topic") || "";

  const [stories, setStories] = useState<CoreStory[]>([]);
  const [selectedStory, setSelectedStory] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(preselectedTopic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ adapted_content: string; tips: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStories(getStories());
  }, []);

  useEffect(() => {
    if (selectedStory && selectedTopic) {
      const existing = getAdaptedStory(selectedStory, selectedTopic);
      if (existing) {
        setResult({ adapted_content: existing.adapted_content, tips: existing.tips });
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [selectedStory, selectedTopic]);

  const story = stories.find((s) => s.id === selectedStory);
  const topic = IELTS_TOPICS.find((t) => t.id === selectedTopic);

  async function handleGenerate() {
    if (!story || !topic) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story: story.content,
          topic: topic.title,
          cue_card: topic.cue_card,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate");
      }

      const data = await res.json();
      setResult(data);

      saveAdaptedStory({
        story_id: story.id,
        topic_id: topic.id,
        adapted_content: data.adapted_content,
        tips: data.tips,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.adapted_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-gray-100">Adapt Story to Topic</h1>
      <p className="mt-2 text-sm text-gray-500">
        Pick one of your stories and a topic. AI will rewrite your story to fit the cue card.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-medium text-gray-400">1. Choose a story</p>
          {stories.length === 0 ? (
            <div className="card py-10 text-center">
              <p className="text-sm text-gray-500">No stories yet.</p>
              <a href="/stories" className="btn-neon mt-4 text-xs">Add a story first</a>
            </div>
          ) : (
            <div className="space-y-2">
              {stories.map((s) => (
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
                    <span className={CATEGORY_COLORS[s.category]}>{CATEGORY_LABELS[s.category]}</span>
                    <span className="text-sm font-medium text-gray-200">{s.title}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-gray-500">{s.content}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-xs font-medium text-gray-400">2. Choose a topic</p>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="input-dark"
          >
            <option value="">Select a topic...</option>
            {IELTS_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                [{CATEGORY_LABELS[t.category]}] {t.title}
              </option>
            ))}
          </select>

          {topic && (
            <div className="card mt-4">
              <p className="text-xs font-medium text-gray-400">Cue Card</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-300">{topic.cue_card}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          className="btn-neon-solid"
          disabled={!selectedStory || !selectedTopic || loading}
          onClick={handleGenerate}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? "Generating..." : result ? "Regenerate" : "Adapt Story"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {result && (
        <div className="mt-8 space-y-5">
          <div className="card">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-gray-200">Adapted Response</h3>
              <button onClick={handleCopy} className="btn-ghost text-xs">
                {copied ? <Check size={14} className="text-neon-green" /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-300">
              {result.adapted_content}
            </p>
            <p className="mt-3 text-xs text-gray-600">
              {result.adapted_content.split(/\s+/).length} words
            </p>
          </div>

          {result.tips && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-200">Speaking Tips</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-400">{result.tips}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
