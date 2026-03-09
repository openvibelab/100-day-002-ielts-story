"use client";

import { useEffect, useState, useRef } from "react";
import {
  Printer,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Trash2,
  Clock,
  BookOpen,
} from "lucide-react";
import { CoreStory, AdaptedStory, CATEGORY_COLORS, StoryCategory } from "@/lib/types";
import {
  getStories,
  getAdaptedStories,
  deleteAdaptedStory,
  updateAdaptedContent,
  exportAllData,
  importAllData,
} from "@/lib/store";
import { IELTS_TOPICS } from "@/data/topics";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SpeakButton } from "@/components/SpeakButton";
import { EditableContent } from "@/components/EditableContent";
import { useLang } from "@/lib/LangContext";
import { ts, t, catLabel } from "@/lib/i18n";

type ViewMode = "by-story" | "timeline";

interface StoryCorpus {
  story: CoreStory;
  adaptations: {
    id: string;
    topicId: string;
    topicTitle: string;
    topicCategory: StoryCategory;
    cueCard: string;
    adaptedContent: string;
    tips: string;
    createdAt: string;
  }[];
}

interface TimelineRecord {
  adapted: AdaptedStory;
  storyTitle: string;
  storyCategory: StoryCategory;
  topicTitle: string;
  topicCategory: StoryCategory;
}

export default function CorpusPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("by-story");
  const [corpus, setCorpus] = useState<StoryCorpus[]>([]);
  const [timeline, setTimeline] = useState<TimelineRecord[]>([]);
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [importResult, setImportResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { locale } = useLang();

  function loadData() {
    const stories = getStories();
    const adapted = getAdaptedStories();

    const result: StoryCorpus[] = stories
      .map((story) => {
        const storyAdapted = adapted.filter((a) => a.story_id === story.id);
        return {
          story,
          adaptations: storyAdapted
            .map((a) => {
              const topic = IELTS_TOPICS.find((t) => t.id === a.topic_id);
              if (!topic) return null;
              return {
                id: a.id,
                topicId: topic.id,
                topicTitle: topic.title,
                topicCategory: topic.category,
                cueCard: topic.cue_card,
                adaptedContent: a.adapted_content,
                tips: a.tips,
                createdAt: a.created_at,
              };
            })
            .filter(Boolean) as StoryCorpus["adaptations"],
        };
      })
      .filter((s) => s.adaptations.length > 0);

    setCorpus(result);
    setExpandedStories(new Set(result.map((s) => s.story.id)));

    const enriched: TimelineRecord[] = adapted
      .map((a) => {
        const story = stories.find((s) => s.id === a.story_id);
        const topic = IELTS_TOPICS.find((t) => t.id === a.topic_id);
        return {
          adapted: a,
          storyTitle: story?.title || "Deleted story",
          storyCategory: story?.category || ("event" as StoryCategory),
          topicTitle: topic?.title || "Unknown topic",
          topicCategory: topic?.category || ("event" as StoryCategory),
        };
      })
      .sort((a, b) => new Date(b.adapted.created_at).getTime() - new Date(a.adapted.created_at).getTime());

    setTimeline(enriched);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleDelete(id: string) {
    deleteAdaptedStory(id);
    loadData();
    setDeleteTarget(null);
    if (expandedTimeline === id) setExpandedTimeline(null);
  }

  async function handleCopy(id: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function toggleStory(id: string) {
    setExpandedStories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const totalAdaptations = corpus.reduce((sum, s) => sum + s.adaptations.length, 0);

  function handlePrint() {
    window.print();
  }

  function handleExportText() {
    const lines: string[] = [];
    lines.push("=".repeat(60));
    lines.push("IELTS Speaking Part 2 -- Personal Corpus");
    lines.push(`Generated: ${new Date().toLocaleDateString()}`);
    lines.push(`Stories: ${corpus.length} | Adaptations: ${totalAdaptations}`);
    lines.push("=".repeat(60));
    lines.push("");

    corpus.forEach((s, si) => {
      lines.push("=".repeat(50));
      lines.push(`STORY ${si + 1}: ${s.story.title} [${catLabel(s.story.category, locale)}]`);
      lines.push("=".repeat(50));
      lines.push("");
      lines.push(locale === "zh" ? "原始故事:" : "Original Story:");
      lines.push(s.story.content);
      lines.push("");

      s.adaptations.forEach((a, ai) => {
        lines.push("-".repeat(40));
        lines.push(`  Topic ${ai + 1}: ${a.topicTitle} [${catLabel(a.topicCategory, locale)}]`);
        lines.push("-".repeat(40));
        lines.push("");
        lines.push("Cue Card:");
        lines.push(a.cueCard);
        lines.push("");
        lines.push(locale === "zh" ? "适配结果:" : "Adapted Response:");
        lines.push(a.adaptedContent);
        if (a.tips) {
          lines.push("");
          lines.push("Tips:");
          lines.push(a.tips);
        }
        lines.push("");
      });
      lines.push("");
    });

    const bom = "\uFEFF";
    const blob = new Blob([bom + lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ielts-corpus-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleExportJSON() {
    const data = exportAllData();
    const bom = "\uFEFF";
    const blob = new Blob([bom + JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ielts-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = (reader.result as string).replace(/^\uFEFF/, "");
        const data = JSON.parse(text);
        if (!data.stories || !data.adapted_stories) {
          setImportResult(locale === "zh" ? "文件格式无效" : "Invalid file format");
          return;
        }
        const result = importAllData(data);
        setImportResult(
          locale === "zh"
            ? `已导入 ${result.stories} 个故事和 ${result.adapted} 条适配`
            : `Imported ${result.stories} stories and ${result.adapted} adaptations`
        );
        loadData();
      } catch {
        setImportResult(locale === "zh" ? "文件解析失败" : "Failed to parse file");
      }
      setTimeout(() => setImportResult(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const deleteMsg = deleteTarget
    ? (t("corpusDeleteMsg", locale) as (title: string) => string)(deleteTarget.title)
    : "";

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-48" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Screen view */}
      <div className="page-container no-print">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{ts("corpusTitle", locale)}</h1>
            <p className="mt-2 text-sm text-gray-500">
              {corpus.length} {ts("corpusStories", locale)} · {totalAdaptations} {ts("corpusAdaptations", locale)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExportJSON} className="btn-ghost text-xs" aria-label="Export JSON">
              <Download size={14} />
              {ts("corpusBackup", locale)}
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="btn-ghost text-xs" aria-label="Import JSON">
              <Upload size={14} />
              {ts("corpusImport", locale)}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <button onClick={handleExportText} className="btn-ghost text-xs" aria-label="Download .txt">
              <Download size={14} />
              {ts("corpusDownload", locale)}
            </button>
            <button onClick={handlePrint} className="btn-neon text-xs" aria-label="Print">
              <Printer size={14} />
              {ts("corpusPrint", locale)}
            </button>
          </div>
        </div>

        {importResult && (
          <div className="mt-3 rounded-lg border border-neon-blue/30 bg-neon-blue/5 px-4 py-2 text-xs text-neon-blue">
            {importResult}
          </div>
        )}

        {totalAdaptations === 0 ? (
          <div className="card mt-8 py-16 text-center">
            <p className="text-lg font-semibold text-gray-300">{ts("corpusNoAdaptations", locale)}</p>
            <p className="mt-2 text-sm text-gray-500">
              {ts("corpusNoAdaptationsDesc", locale)}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/adapt" className="btn-neon text-xs">{ts("corpusSingleAdapt", locale)}</Link>
              <Link href="/batch" className="btn-neon text-xs">{ts("corpusBatchAdapt", locale)}</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setViewMode("by-story")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "by-story"
                    ? "bg-neon-blue/10 text-neon-blue"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <BookOpen size={12} />
                {ts("corpusByStory", locale)}
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "timeline"
                    ? "bg-neon-blue/10 text-neon-blue"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Clock size={12} />
                {ts("corpusTimeline", locale)}
              </button>
            </div>

            {/* By-story view */}
            {viewMode === "by-story" && (
              <div className="mt-4 space-y-6">
                {corpus.map((s) => {
                  const isExpanded = expandedStories.has(s.story.id);
                  return (
                    <div key={s.story.id} className="card">
                      <button
                        onClick={() => toggleStory(s.story.id)}
                        className="flex w-full items-center justify-between gap-3 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`tag-${s.story.category}`}>
                            {catLabel(s.story.category, locale)}
                          </span>
                          <h2 className="text-base font-semibold text-gray-200">
                            {s.story.title}
                          </h2>
                          <span className="text-xs text-gray-500">
                            {s.adaptations.length} {ts("progressTopics", locale)}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={16} className="shrink-0 text-gray-500" />
                        ) : (
                          <ChevronDown size={16} className="shrink-0 text-gray-500" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-4 space-y-4">
                          <div className="rounded-lg border border-dark-border bg-dark-surface p-4">
                            <p className="text-xs font-medium text-gray-500">{ts("corpusOriginalStory", locale)}</p>
                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-400">
                              {s.story.content}
                            </p>
                          </div>

                          {s.adaptations.map((a, i) => {
                            const isCopied = copiedId === a.id;
                            return (
                              <div key={a.topicId} className="border-t border-dark-border pt-4">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-600">#{i + 1}</span>
                                    <span className={`tag-${a.topicCategory}`}>
                                      {catLabel(a.topicCategory, locale)}
                                    </span>
                                    <span className="text-sm font-medium text-gray-200">{a.topicTitle}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <SpeakButton text={a.adaptedContent} />
                                    <button
                                      onClick={() => handleCopy(a.id, a.adaptedContent)}
                                      className="btn-ghost !px-2 !py-1 text-xs"
                                      aria-label={ts("copy", locale)}
                                    >
                                      {isCopied ? <Check size={12} className="text-neon-green" /> : <Copy size={12} />}
                                    </button>
                                    <button
                                      onClick={() => setDeleteTarget({ id: a.id, title: a.topicTitle })}
                                      className="rounded p-1 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                      aria-label={ts("delete", locale)}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                <details className="mt-2">
                                  <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-400">
                                    {ts("corpusCueCard", locale)}
                                  </summary>
                                  <p className="mt-1 whitespace-pre-line text-xs leading-6 text-gray-500">
                                    {a.cueCard}
                                  </p>
                                </details>
                                <EditableContent
                                  content={a.adaptedContent}
                                  onSave={(newContent) => {
                                    updateAdaptedContent(a.id, newContent);
                                    loadData();
                                  }}
                                  className="mt-3"
                                />
                                {a.tips && (
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-400">
                                      {ts("corpusSpeakingTips", locale)}
                                    </summary>
                                    <p className="mt-1 whitespace-pre-line text-xs leading-6 text-gray-400">
                                      {a.tips}
                                    </p>
                                  </details>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Timeline view */}
            {viewMode === "timeline" && (
              <div className="mt-4 space-y-3">
                {timeline.map((r) => {
                  const isExpanded = expandedTimeline === r.adapted.id;
                  const isCopied = copiedId === r.adapted.id;
                  const wordCount = r.adapted.adapted_content.split(/\s+/).length;

                  return (
                    <div key={r.adapted.id} className="card">
                      <button
                        onClick={() => setExpandedTimeline(isExpanded ? null : r.adapted.id)}
                        className="flex w-full items-start justify-between gap-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={CATEGORY_COLORS[r.topicCategory]}>
                              {catLabel(r.topicCategory, locale)}
                            </span>
                            <span className="text-sm font-medium text-gray-200">
                              {r.topicTitle}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                            <span>{locale === "zh" ? "来自" : "from"}: {r.storyTitle}</span>
                            <span>·</span>
                            <span>{wordCount} {ts("words", locale)}</span>
                            <span>·</span>
                            <span>{formatDate(r.adapted.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-gray-500" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-500" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 border-t border-dark-border pt-4">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-xs font-medium text-gray-400">{ts("adaptResult", locale)}</h4>
                            <div className="flex gap-1">
                              <SpeakButton text={r.adapted.adapted_content} />
                              <button
                                onClick={() => handleCopy(r.adapted.id, r.adapted.adapted_content)}
                                className="btn-ghost !px-2 !py-1 text-xs"
                                aria-label={ts("copy", locale)}
                              >
                                {isCopied ? (
                                  <Check size={14} className="text-neon-green" />
                                ) : (
                                  <Copy size={14} />
                                )}
                                {isCopied ? ts("copied", locale) : ts("copy", locale)}
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ id: r.adapted.id, title: r.topicTitle })}
                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                aria-label={ts("delete", locale)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <EditableContent
                            content={r.adapted.adapted_content}
                            onSave={(newContent) => {
                              updateAdaptedContent(r.adapted.id, newContent);
                              loadData();
                            }}
                            className="mt-3"
                          />

                          {r.adapted.tips && (
                            <div className="mt-4 border-t border-dark-border pt-4">
                              <h4 className="text-xs font-medium text-gray-400">{ts("corpusSpeakingTips", locale)}</h4>
                              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-400">
                                {r.adapted.tips}
                              </p>
                            </div>
                          )}

                          <div className="mt-4">
                            <Link
                              href={`/adapt?topic=${r.adapted.topic_id}`}
                              className="btn-neon text-xs"
                            >
                              {ts("adaptRegenerate", locale)}
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Print view */}
      <div className="hidden print:block" style={{ padding: "0 20px" }}>
        <div className="print-corpus">
          <h1>IELTS Speaking Part 2 -- Personal Corpus</h1>
          <p className="print-meta">
            {corpus.length} stories · {totalAdaptations} adaptations ·{" "}
            {new Date().toLocaleDateString()}
          </p>

          {corpus.map((s) => (
            <div key={s.story.id} className="print-story">
              <h2>
                {s.story.title}{" "}
                <span className="print-cat">[{catLabel(s.story.category, locale)}]</span>
              </h2>

              <div className="print-original">
                <h3>{ts("corpusOriginalStory", locale)}</h3>
                <p>{s.story.content}</p>
              </div>

              {s.adaptations.map((a, i) => (
                <div key={a.topicId} className="print-adaptation">
                  <h3>
                    #{i + 1} {a.topicTitle}{" "}
                    <span className="print-cat">[{catLabel(a.topicCategory, locale)}]</span>
                  </h3>
                  <div className="print-cuecard">
                    <strong>Cue Card:</strong>
                    <p>{a.cueCard}</p>
                  </div>
                  <div className="print-response">
                    <strong>Response:</strong>
                    <p>{a.adaptedContent}</p>
                  </div>
                  {a.tips && (
                    <div className="print-tips">
                      <strong>Tips:</strong>
                      <p>{a.tips}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={ts("corpusDeleteTitle", locale)}
        message={deleteMsg}
        confirmLabel={ts("delete", locale)}
        danger
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
