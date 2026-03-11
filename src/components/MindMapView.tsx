"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { IELTS_TOPICS } from "@/data/topics";
import { AdaptedStory, CoreStory, StoryCategory } from "@/lib/types";
import { getAdaptedStories, getStories } from "@/lib/store";
import { useLang } from "@/lib/LangContext";
import { catLabel, ts } from "@/lib/i18n";

const CATEGORY_NODE_COLORS: Record<StoryCategory, string> = {
  person: "#3b82f6",
  event: "#22c55e",
  object: "#a855f7",
  place: "#f59e0b",
};

function buildStoryGraph(
  story: CoreStory,
  adaptedStories: AdaptedStory[],
  locale: "en" | "zh"
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    {
      id: `story-${story.id}`,
      position: { x: 0, y: 0 },
      data: {
        label: (
          <div>
            <div style={{ fontSize: "10px", opacity: 0.7, marginBottom: 4 }}>
              {catLabel(story.category, locale)}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{story.title}</div>
          </div>
        ),
      },
      style: {
        background: "#00d4ff",
        color: "#03111a",
        border: "none",
        borderRadius: "14px",
        padding: "12px 18px",
        boxShadow: "0 0 24px rgba(0, 212, 255, 0.35)",
        maxWidth: "220px",
      },
    },
  ];
  const edges: Edge[] = [];

  const topicRadius = Math.max(180, 120 + adaptedStories.length * 14);
  adaptedStories.forEach((adaptedStory, index) => {
    const topic = IELTS_TOPICS.find((candidate) => candidate.id === adaptedStory.topic_id);
    if (!topic) {
      return;
    }

    const angle = (2 * Math.PI * index) / Math.max(adaptedStories.length, 1) - Math.PI / 2;
    const x = topicRadius * Math.cos(angle);
    const y = topicRadius * Math.sin(angle);
    const color = CATEGORY_NODE_COLORS[topic.category];

    nodes.push({
      id: `topic-${story.id}-${topic.id}`,
      position: { x, y },
      data: {
        label: (
          <div style={{ fontSize: "11px" }} title={topic.title}>
            {topic.title.length > 38 ? `${topic.title.slice(0, 35)}...` : topic.title}
          </div>
        ),
        topicId: topic.id,
        storyId: story.id,
      },
      style: {
        background: "#12121a",
        color: "#d8def7",
        border: `1px solid ${color}`,
        borderRadius: "10px",
        padding: "8px 12px",
        maxWidth: "180px",
        cursor: "pointer",
        boxShadow: `0 0 12px ${color}22`,
      },
    });

    edges.push({
      id: `edge-${story.id}-${topic.id}`,
      source: `story-${story.id}`,
      target: `topic-${story.id}-${topic.id}`,
      style: { stroke: color, strokeWidth: 1.5, opacity: 0.45 },
      animated: true,
    });
  });

  return { nodes, edges };
}

export default function MindMapView() {
  const [stories, setStories] = useState<CoreStory[]>([]);
  const [adaptedStories, setAdaptedStories] = useState<AdaptedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLang();

  useEffect(() => {
    setStories(getStories());
    setAdaptedStories(getAdaptedStories());
    setLoading(false);
  }, []);

  const selectedStoryId = searchParams.get("story") || "";
  const selectedStory = useMemo(
    () => stories.find((story) => story.id === selectedStoryId) || null,
    [stories, selectedStoryId]
  );

  const storyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const adaptedStory of adaptedStories) {
      counts.set(adaptedStory.story_id, (counts.get(adaptedStory.story_id) || 0) + 1);
    }
    return counts;
  }, [adaptedStories]);

  const selectedStoryAdapted = useMemo(
    () => adaptedStories.filter((adaptedStory) => adaptedStory.story_id === selectedStoryId),
    [adaptedStories, selectedStoryId]
  );

  const { nodes, edges } = useMemo(
    () =>
      selectedStory
        ? buildStoryGraph(selectedStory, selectedStoryAdapted, locale)
        : { nodes: [], edges: [] },
    [selectedStory, selectedStoryAdapted, locale]
  );

  const graphKey = useMemo(
    () => `${selectedStoryId}-${selectedStoryAdapted.length}-${locale}`,
    [selectedStoryAdapted.length, selectedStoryId, locale]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.data?.topicId && node.data?.storyId) {
        router.push(`/adapt?topic=${node.data.topicId}&story=${node.data.storyId}`);
      }
    },
    [router]
  );

  function openStoryMap(storyId: string) {
    router.push(`/mind-map?story=${storyId}`);
  }

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="text-2xl font-bold text-gray-100">{ts("mindMapTitle", locale)}</h1>
        <div className="skeleton mt-6 h-[60vh] w-full" />
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="page-container">
        <h1 className="text-2xl font-bold text-gray-100">{ts("mindMapTitle", locale)}</h1>
        <p className="mt-2 text-sm text-gray-500">{ts("mindMapDesc", locale)}</p>
        <div className="card mt-6 py-16 text-center">
          <p className="text-lg font-semibold text-gray-300">{ts("mindMapEmpty", locale)}</p>
          <p className="mt-2 text-sm text-gray-500">{ts("mindMapEmptyDesc", locale)}</p>
          <Link href="/stories" className="btn-neon mt-6 text-xs">
            {ts("mindMapAddStories", locale)}
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedStory) {
    return (
      <div className="page-container">
        <h1 className="text-2xl font-bold text-gray-100">{ts("mindMapTitle", locale)}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500">
          {locale === "zh"
            ? "先选一个核心故事，再进入它自己的串题导图。这样每个故事都是单独一张图，不会把所有内容堆在一起。"
            : "Choose one story first, then open its own topic map. Each story gets a separate map so the canvas stays readable."}
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stories.map((story) => {
            const count = storyCounts.get(story.id) || 0;
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => openStoryMap(story.id)}
                className="rounded-2xl border border-dark-border bg-dark-card p-5 text-left transition-all hover:border-neon-blue/50 hover:bg-dark-surface"
              >
                <div className="flex items-center gap-2">
                  <span className={`tag-${story.category}`}>{catLabel(story.category, locale)}</span>
                  <span className="text-xs text-gray-500">
                    {count} {locale === "zh" ? "个已串题" : "mapped topics"}
                  </span>
                </div>
                <h2 className="mt-3 text-base font-semibold text-gray-100">{story.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">{story.content}</p>
                <p className="mt-4 text-xs font-medium text-neon-blue">
                  {locale === "zh" ? "进入这个故事的导图" : "Open this story map"}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container no-print">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push("/mind-map")}
            className="text-xs text-neon-blue hover:underline"
          >
            {locale === "zh" ? "返回故事列表" : "Back to story list"}
          </button>
          <h1 className="mt-3 text-2xl font-bold text-gray-100">{selectedStory.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {catLabel(selectedStory.category, locale)} · {selectedStoryAdapted.length}{" "}
            {locale === "zh" ? "个已串题话题" : "connected topics"}
          </p>
        </div>
        <div className="flex max-w-full flex-wrap gap-2">
          {stories.map((story) => {
            const active = story.id === selectedStory.id;
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => openStoryMap(story.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-neon-blue bg-neon-blue/10 text-neon-blue"
                    : "border-dark-border text-gray-400 hover:border-gray-500 hover:text-gray-200"
                }`}
              >
                {story.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card mt-6">
        <p className="text-xs font-medium text-gray-500">
          {locale === "zh" ? "核心故事摘要" : "Core story summary"}
        </p>
        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-400">
          {selectedStory.content}
        </p>
      </div>

      {selectedStoryAdapted.length === 0 ? (
        <div className="card mt-6 py-16 text-center">
          <p className="text-lg font-semibold text-gray-300">
            {locale === "zh" ? "这个故事还没有生成任何串题结果" : "This story has no mapped topics yet"}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {locale === "zh"
              ? "先去改编工作台生成几条回答，这里就会长出这一个故事自己的题目导图。"
              : "Generate a few adaptations first, then this story will grow its own topic map."}
          </p>
          <Link href={`/adapt?story=${selectedStory.id}`} className="btn-neon mt-6 text-xs">
            {locale === "zh" ? "去生成" : "Generate now"}
          </Link>
        </div>
      ) : (
        <div className="relative mt-6 h-[70vh] overflow-hidden rounded-2xl border border-dark-border bg-dark-bg">
          <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-xl bg-dark-bg/70 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">
              {locale === "zh" ? "故事导图" : "Story map"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {locale === "zh"
                ? "点击题目节点可直接回到改编工作台查看或重做。"
                : "Click a topic node to jump back into the adaptation workspace."}
            </p>
          </div>

          <ReactFlow
            key={graphKey}
            defaultNodes={nodes}
            defaultEdges={edges}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.3}
            maxZoom={1.8}
            proOptions={{ hideAttribution: true }}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable={false}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1a1a2e" />
            <Controls showInteractive={false} position="bottom-right" />
          </ReactFlow>
        </div>
      )}
    </div>
  );
}
