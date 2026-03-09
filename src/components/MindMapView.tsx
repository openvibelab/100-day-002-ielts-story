"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { CoreStory } from "@/lib/types";
import { getStories, getAdaptedStories } from "@/lib/store";
import { IELTS_TOPICS } from "@/data/topics";
import { AdaptedStory } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { ts, catLabel } from "@/lib/i18n";

const CATEGORY_NODE_COLORS: Record<string, string> = {
  person: "#3b82f6",
  event: "#22c55e",
  object: "#a855f7",
  place: "#f59e0b",
};

function buildGraph(
  stories: CoreStory[],
  adapted: AdaptedStory[],
  locale: "en" | "zh"
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Center node
  nodes.push({
    id: "center",
    position: { x: 0, y: 0 },
    data: { label: ts("mindMapMyStories", locale) },
    style: {
      background: "#00d4ff",
      color: "#000",
      border: "none",
      borderRadius: "12px",
      padding: "12px 20px",
      fontWeight: 700,
      fontSize: "14px",
      boxShadow: "0 0 20px rgba(0, 212, 255, 0.4)",
    },
  });

  // Dynamic radius based on story count
  const storyRadius = Math.max(220, 140 + stories.length * 40);

  stories.forEach((story, i) => {
    const angle = (2 * Math.PI * i) / Math.max(stories.length, 1) - Math.PI / 2;
    const x = storyRadius * Math.cos(angle);
    const y = storyRadius * Math.sin(angle);
    const color = CATEGORY_NODE_COLORS[story.category] || "#00d4ff";

    nodes.push({
      id: `story-${story.id}`,
      position: { x, y },
      data: {
        label: (
          <div>
            <div style={{ fontSize: "10px", opacity: 0.7, marginBottom: 2 }}>
              {catLabel(story.category, locale)}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 600 }}>
              {story.title.length > 20 ? story.title.slice(0, 18) + "…" : story.title}
            </div>
          </div>
        ),
      },
      style: {
        background: "#1a1a2e",
        color: "#e0e0e0",
        border: `2px solid ${color}`,
        borderRadius: "10px",
        padding: "8px 14px",
        fontSize: "12px",
        boxShadow: `0 0 12px ${color}33`,
        maxWidth: "160px",
        cursor: "pointer",
      },
    });

    edges.push({
      id: `center-story-${story.id}`,
      source: "center",
      target: `story-${story.id}`,
      style: { stroke: color, strokeWidth: 2, opacity: 0.5 },
      animated: true,
    });

    // Topic nodes around each story
    const storyAdapted = adapted.filter((a) => a.story_id === story.id);
    const topicCount = storyAdapted.length;
    if (topicCount === 0) return;

    // Larger radius for more topics, prevent overlap
    const topicRadius = Math.max(140, 100 + topicCount * 12);
    // Spread evenly around the story's direction
    const arcSpread = Math.min(Math.PI * 1.6, Math.max(0.8, topicCount * 0.3));

    storyAdapted.forEach((a, j) => {
      const topic = IELTS_TOPICS.find((t) => t.id === a.topic_id);
      if (!topic) return;

      const offset = topicCount === 1
        ? 0
        : (j - (topicCount - 1) / 2) * (arcSpread / (topicCount - 1));
      const tAngle = angle + offset;
      const tx = x + topicRadius * Math.cos(tAngle);
      const ty = y + topicRadius * Math.sin(tAngle);
      const tColor = CATEGORY_NODE_COLORS[topic.category] || "#666";

      const nodeId = `topic-${story.id}-${topic.id}`;

      nodes.push({
        id: nodeId,
        position: { x: tx, y: ty },
        data: {
          label: (
            <div style={{ fontSize: "10px" }} title={topic.title}>
              {topic.title.length > 28 ? topic.title.slice(0, 26) + "…" : topic.title}
            </div>
          ),
          topicId: topic.id,
          storyId: story.id,
        },
        style: {
          background: "#12121a",
          color: tColor,
          border: `1px solid ${tColor}44`,
          borderRadius: "8px",
          padding: "6px 10px",
          maxWidth: "160px",
          cursor: "pointer",
        },
      });

      edges.push({
        id: `edge-${story.id}-${topic.id}`,
        source: `story-${story.id}`,
        target: nodeId,
        style: { stroke: tColor, strokeWidth: 1, opacity: 0.3 },
      });
    });
  });

  return { nodes, edges };
}

export default function MindMapView() {
  const [stories, setStories] = useState<CoreStory[]>([]);
  const [adapted, setAdapted] = useState<AdaptedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { locale } = useLang();

  useEffect(() => {
    setStories(getStories());
    setAdapted(getAdaptedStories());
    setLoading(false);
  }, []);

  const { nodes, edges } = useMemo(
    () => buildGraph(stories, adapted, locale),
    [stories, adapted, locale]
  );

  // Force remount ReactFlow when data changes by using a key
  const graphKey = useMemo(
    () => `${stories.length}-${adapted.length}-${locale}`,
    [stories.length, adapted.length, locale]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.data?.topicId && node.data?.storyId) {
      router.push(`/adapt?topic=${node.data.topicId}&story=${node.data.storyId}`);
    }
  }, [router]);

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
        <p className="mt-2 text-sm text-gray-500">
          {ts("mindMapDesc", locale)}
        </p>
        <div className="card mt-6 py-16 text-center">
          <p className="text-lg font-semibold text-gray-300">{ts("mindMapEmpty", locale)}</p>
          <p className="mt-2 text-sm text-gray-500">{ts("mindMapEmptyDesc", locale)}</p>
          <a href="/stories" className="btn-neon mt-6 text-xs">{ts("mindMapAddStories", locale)}</a>
        </div>
      </div>
    );
  }

  const totalAdapted = adapted.length;

  return (
    <div className="no-print relative" style={{ height: "calc(100vh - 65px)" }}>
      {/* Info overlay — top-left */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 md:left-6">
        <h1 className="text-lg font-bold text-gray-100">{ts("mindMapTitle", locale)}</h1>
        <p className="text-xs text-gray-500">
          {stories.length} {ts("progressStories", locale)} · {totalAdapted} {ts("progressAdaptations", locale)} · {ts("mindMapClickToView", locale)}
        </p>
      </div>

      {/* Legend overlay — top-right */}
      <div className="pointer-events-none absolute right-4 top-4 z-10 flex flex-wrap gap-2 rounded-lg bg-dark-bg/70 px-3 py-2 backdrop-blur-sm md:right-6">
        {Object.entries(CATEGORY_NODE_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            <span className="text-[10px] text-gray-400">{catLabel(cat as "person" | "event" | "object" | "place", locale)}</span>
          </div>
        ))}
      </div>

      {/* ReactFlow canvas */}
      <ReactFlow
        key={graphKey}
        defaultNodes={nodes}
        defaultEdges={edges}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1a1a2e" />
        <Controls
          showInteractive={false}
          position="bottom-right"
          style={{ bottom: 20, right: 20 }}
        />
      </ReactFlow>
    </div>
  );
}
