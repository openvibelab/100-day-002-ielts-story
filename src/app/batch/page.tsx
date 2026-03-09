"use client";

import { useEffect, useState, useRef } from "react";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Square,
  CheckSquare,
  Pause,
  Play,
  Settings,
  PartyPopper,
} from "lucide-react";
import { CoreStory, StoryCategory, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import { IELTS_TOPICS } from "@/data/topics";
import {
  getStories,
  getAdaptedStory,
  saveAdaptedStory,
  getAdaptedStories,
  saveBatchState,
  getBatchState,
  clearBatchState,
} from "@/lib/store";
import { hasUserApiKey, getUserApiKey, getUserProvider } from "@/lib/ai";
import { ApiKeySetup, ApiKeyBadge } from "@/components/ApiKeySetup";
import Link from "next/link";

type TaskStatus = "pending" | "running" | "done" | "error" | "skipped";

interface BatchTask {
  topicId: string;
  topicTitle: string;
  topicCategory: StoryCategory;
  status: TaskStatus;
  error?: string;
}

const CATEGORIES: StoryCategory[] = ["person", "event", "object", "place"];
const DELAY_OPTIONS = [
  { value: 500, label: "Fast (0.5s)" },
  { value: 2000, label: "Normal (2s)" },
  { value: 4000, label: "Safe (4s)" },
];

export default function BatchPage() {
  const [stories, setStories] = useState<CoreStory[]>([]);
  const [selectedStory, setSelectedStory] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<BatchTask[]>([]);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const pausedRef = useRef(false);
  const abortRef = useRef(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [filterCat, setFilterCat] = useState<StoryCategory | "all">("all");
  const [skipExisting, setSkipExisting] = useState(true);
  const [delay, setDelay] = useState(4000);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeInfo, setResumeInfo] = useState<{ storyTitle: string; remaining: number } | null>(null);

  useEffect(() => {
    const loadedStories = getStories();
    setStories(loadedStories);

    // Check for resumable batch state (C-3)
    const saved = getBatchState();
    if (saved) {
      const story = loadedStories.find((s) => s.id === saved.storyId);
      if (story) {
        const remaining = saved.topicIds.length - saved.completedTopicIds.length - saved.failedTopicIds.length;
        if (remaining > 0) {
          setResumeInfo({ storyTitle: story.title, remaining });
          setShowResume(true);
          setSelectedStory(saved.storyId);
        } else {
          clearBatchState();
        }
      } else {
        clearBatchState();
      }
    }
  }, []);

  const story = stories.find((s) => s.id === selectedStory);

  const filteredTopics = IELTS_TOPICS.filter(
    (t) => filterCat === "all" || t.category === filterCat
  );

  function toggleTopic(id: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedTopics(new Set(filteredTopics.map((t) => t.id)));
  }

  function selectNone() {
    setSelectedTopics(new Set());
  }

  function selectUnadapted() {
    if (!selectedStory) return;
    const adapted = getAdaptedStories();
    const adaptedTopicIds = new Set(
      adapted.filter((a) => a.story_id === selectedStory).map((a) => a.topic_id)
    );
    setSelectedTopics(
      new Set(filteredTopics.filter((t) => !adaptedTopicIds.has(t.id)).map((t) => t.id))
    );
  }

  function handleResume() {
    const saved = getBatchState();
    if (!saved) return;
    setSelectedStory(saved.storyId);
    const done = new Set([...saved.completedTopicIds, ...saved.failedTopicIds]);
    const remaining = saved.topicIds.filter((id) => !done.has(id));
    setSelectedTopics(new Set(remaining));
    setShowResume(false);
    clearBatchState();
  }

  function handleDismissResume() {
    clearBatchState();
    setShowResume(false);
  }

  async function handleStart() {
    if (!story || selectedTopics.size === 0) return;

    abortRef.current = false;
    pausedRef.current = false;
    setPaused(false);
    setRunning(true);
    setFinished(false);

    const topicIds = Array.from(selectedTopics);
    const taskList: BatchTask[] = topicIds.map((topicId) => {
      const topic = IELTS_TOPICS.find((t) => t.id === topicId)!;
      return {
        topicId,
        topicTitle: topic.title,
        topicCategory: topic.category,
        status: "pending" as TaskStatus,
      };
    });

    setTasks(taskList);
    setProgress({ done: 0, total: taskList.length });

    // Save batch state for resume (C-3)
    const batchState = {
      storyId: story.id,
      topicIds,
      completedTopicIds: [] as string[],
      failedTopicIds: [] as string[],
      timestamp: new Date().toISOString(),
    };
    saveBatchState(batchState);

    for (let i = 0; i < taskList.length; i++) {
      if (abortRef.current) break;

      while (pausedRef.current && !abortRef.current) {
        await new Promise((r) => setTimeout(r, 300));
      }
      if (abortRef.current) break;

      const task = taskList[i];
      const topic = IELTS_TOPICS.find((t) => t.id === task.topicId)!;

      // Skip if already adapted
      if (skipExisting && getAdaptedStory(story.id, task.topicId)) {
        taskList[i] = { ...task, status: "skipped" };
        batchState.completedTopicIds.push(task.topicId);
        setTasks([...taskList]);
        setProgress({ done: i + 1, total: taskList.length });
        saveBatchState(batchState);
        continue;
      }

      taskList[i] = { ...task, status: "running" };
      setTasks([...taskList]);

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
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        saveAdaptedStory({
          story_id: story.id,
          topic_id: topic.id,
          adapted_content: data.adapted_content,
          tips: data.tips || "",
        });

        taskList[i] = { ...task, status: "done" };
        batchState.completedTopicIds.push(task.topicId);
      } catch (e) {
        taskList[i] = {
          ...task,
          status: "error",
          error: e instanceof Error ? e.message : "Failed",
        };
        batchState.failedTopicIds.push(task.topicId);
      }

      setTasks([...taskList]);
      setProgress({ done: i + 1, total: taskList.length });
      saveBatchState(batchState);

      // Configurable delay (M-9, N-5)
      if (i < taskList.length - 1 && !abortRef.current) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    clearBatchState();
    setRunning(false);
    setFinished(true);
  }

  function handlePauseResume() {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }

  function handleStop() {
    abortRef.current = true;
    pausedRef.current = false;
    setPaused(false);
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const errorCount = tasks.filter((t) => t.status === "error").length;
  const skippedCount = tasks.filter((t) => t.status === "skipped").length;

  // Estimate remaining time
  const remainingTasks = tasks.filter((t) => t.status === "pending").length;
  const estimatedSeconds = Math.round(remainingTasks * ((delay + 2000) / 1000));
  const estimatedMin = Math.floor(estimatedSeconds / 60);
  const estimatedSec = estimatedSeconds % 60;

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-gray-100">Batch Adapt</h1>
      <p className="mt-2 text-sm text-gray-500">
        Select a story and multiple topics. AI will adapt your story to each topic one by one.
      </p>

      {/* Resume banner (C-3) */}
      {showResume && resumeInfo && (
        <div className="card mt-4 flex items-center justify-between gap-3 border-amber-500/30 bg-amber-500/5">
          <div>
            <p className="text-sm text-amber-400">
              Unfinished batch: &quot;{resumeInfo.storyTitle}&quot; — {resumeInfo.remaining} topics remaining
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleResume} className="btn-neon text-xs">
              Resume
            </button>
            <button onClick={handleDismissResume} className="btn-ghost text-xs">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Choose story */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-medium text-gray-400">1. Choose a story</p>
        {stories.length === 0 ? (
          <div className="card py-10 text-center">
            <p className="text-sm text-gray-500">No stories yet.</p>
            <Link href="/stories" className="btn-neon mt-4 text-xs">
              Add a story first
            </Link>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStory(s.id)}
                disabled={running}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedStory === s.id
                    ? "border-neon-blue bg-neon-blue/5"
                    : "border-dark-border bg-dark-card hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={CATEGORY_COLORS[s.category] + " !text-[10px] !px-1.5 !py-0.5"}>
                    {CATEGORY_LABELS[s.category]}
                  </span>
                  <span className="min-w-0 truncate text-sm font-medium text-gray-200">{s.title}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Choose topics */}
      {selectedStory && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium text-gray-400">
            2. Choose topics ({selectedTopics.size} selected)
          </p>

          {/* Filter + actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterCat("all")}
              disabled={running}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                filterCat === "all"
                  ? "border-neon-blue bg-neon-blue/10 text-neon-blue"
                  : "border-dark-border text-gray-500 hover:text-gray-300"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                disabled={running}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  filterCat === cat
                    ? "border-neon-blue bg-neon-blue/10 text-neon-blue"
                    : "border-dark-border text-gray-500 hover:text-gray-300"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
            <span className="mx-1 text-gray-700">|</span>
            <button onClick={selectAll} disabled={running} className="text-xs text-neon-blue hover:underline">
              Select All
            </button>
            <button onClick={selectNone} disabled={running} className="text-xs text-gray-500 hover:underline">
              Clear
            </button>
            <button onClick={selectUnadapted} disabled={running} className="text-xs text-neon-green hover:underline">
              Untouched Only
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={skipExisting}
                onChange={(e) => setSkipExisting(e.target.checked)}
                disabled={running}
                className="accent-neon-blue"
              />
              Skip already adapted
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-400">
              Delay:
              <select
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                disabled={running}
                className="rounded border border-dark-border bg-dark-surface px-2 py-1 text-xs text-gray-300"
              >
                {DELAY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Topic grid with scroll hint (m-3) */}
          <div className="scroll-fade-bottom relative mt-3 max-h-[360px] overflow-y-auto pr-1">
            <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTopics.map((t) => {
                const selected = selectedTopics.has(t.id);
                const hasAdapted = selectedStory
                  ? !!getAdaptedStory(selectedStory, t.id)
                  : false;
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTopic(t.id)}
                    disabled={running}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                      selected
                        ? "border-neon-blue/50 bg-neon-blue/5"
                        : "border-dark-border bg-dark-card hover:border-gray-600"
                    }`}
                  >
                    {selected ? (
                      <CheckSquare size={14} className="shrink-0 text-neon-blue" />
                    ) : (
                      <Square size={14} className="shrink-0 text-gray-600" />
                    )}
                    <span className="min-w-0 truncate text-gray-300">{t.title}</span>
                    {hasAdapted && (
                      <CheckCircle2 size={12} className="ml-auto shrink-0 text-green-500/50" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {selectedStory && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!running ? (
            <button
              className="btn-neon-solid"
              disabled={selectedTopics.size === 0}
              onClick={handleStart}
            >
              <Sparkles size={16} />
              Start Batch ({selectedTopics.size} topics)
            </button>
          ) : (
            <>
              <button className="btn-ghost text-xs" onClick={handlePauseResume}>
                {paused ? <Play size={14} /> : <Pause size={14} />}
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                className="btn-ghost text-xs text-red-400"
                onClick={handleStop}
              >
                Stop
              </button>
              {remainingTasks > 0 && (
                <span className="text-xs text-gray-500">
                  ~{estimatedMin > 0 ? `${estimatedMin}m ` : ""}{estimatedSec}s remaining
                </span>
              )}
            </>
          )}

          <button
            className="btn-ghost text-xs"
            onClick={() => setShowApiSetup(!showApiSetup)}
          >
            <Settings size={14} />
            API Key
          </button>
          <ApiKeyBadge />
        </div>
      )}

      <ApiKeySetup show={showApiSetup} />

      {/* Completion summary (M-5) */}
      {finished && !running && tasks.length > 0 && (
        <div className="card mt-6 border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-3">
            <PartyPopper size={24} className="text-green-400" />
            <div>
              <h3 className="text-sm font-semibold text-green-400">Batch Complete!</h3>
              <p className="mt-1 text-xs text-gray-400">
                {doneCount} generated · {skippedCount} skipped · {errorCount} failed
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Link href="/corpus" className="btn-neon text-xs">
              View Corpus
            </Link>
            <Link href="/mind-map" className="btn-ghost text-xs">
              See Mind Map
            </Link>
          </div>
        </div>
      )}

      {/* Progress */}
      {tasks.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              {progress.done}/{progress.total}
              {doneCount > 0 && <span className="ml-2 text-green-400">{doneCount} done</span>}
              {skippedCount > 0 && <span className="ml-2 text-gray-500">{skippedCount} skipped</span>}
              {errorCount > 0 && <span className="ml-2 text-red-400">{errorCount} failed</span>}
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-dark-surface">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%`,
                background: errorCount > 0
                  ? "linear-gradient(90deg, #22c55e, #ef4444)"
                  : "#00d4ff",
                boxShadow: "0 0 10px rgba(0, 212, 255, 0.5)",
              }}
            />
          </div>

          {/* Task list */}
          <div className="mt-4 max-h-[400px] space-y-1 overflow-y-auto pr-1">
            {tasks.map((task) => (
              <div
                key={task.topicId}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-xs ${
                  task.status === "running"
                    ? "border-neon-blue/30 bg-neon-blue/5"
                    : task.status === "done"
                    ? "border-green-500/20 bg-green-500/5"
                    : task.status === "error"
                    ? "border-red-500/20 bg-red-500/5"
                    : task.status === "skipped"
                    ? "border-dark-border bg-dark-card opacity-50"
                    : "border-dark-border bg-dark-card"
                }`}
              >
                {task.status === "running" && (
                  <Loader2 size={14} className="shrink-0 animate-spin text-neon-blue" />
                )}
                {task.status === "done" && (
                  <CheckCircle2 size={14} className="shrink-0 text-green-400" />
                )}
                {task.status === "error" && (
                  <XCircle size={14} className="shrink-0 text-red-400" />
                )}
                {task.status === "skipped" && (
                  <CheckCircle2 size={14} className="shrink-0 text-gray-600" />
                )}
                {task.status === "pending" && (
                  <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-gray-700" />
                )}

                <span className={CATEGORY_COLORS[task.topicCategory] + " !text-[10px] !px-1.5 !py-0.5"}>
                  {CATEGORY_LABELS[task.topicCategory]}
                </span>
                <span className="min-w-0 truncate text-gray-300">{task.topicTitle}</span>

                {task.status === "skipped" && (
                  <span className="ml-auto shrink-0 text-gray-600">Already adapted</span>
                )}
                {task.error && (
                  <span className="ml-auto shrink-0 text-red-400">{task.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
