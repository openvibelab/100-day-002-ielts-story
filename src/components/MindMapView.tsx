"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { CoreStory, CATEGORY_LABELS } from "@/lib/types";
import { getStories, getAdaptedStories } from "@/lib/store";
import { IELTS_TOPICS } from "@/data/topics";
import { AdaptedStory } from "@/lib/types";
import { useRouter } from "next/navigation";

const CATEGORY_NODE_COLORS: Record<string, string> = {
  person: "#3b82f6",
  event: "#22c55e",
  object: "#a855f7",
  place: "#f59e0b",
};

export default function MindMapView() {
  const [stories, setStories] = useState<CoreStory[]>([]);
  const [adapted, setAdapted] = useState<AdaptedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setStories(getStories());
    setAdapted(getAdaptedStories());
    setLoading(false);
  }, []);

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Center node
    nodes.push({
      id: "center",
      position: { x: 400, y: 300 },
      data: { label: "My Stories" },
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

    // Story nodes in a circle around center
    const storyRadius = 250;
    stories.forEach((story, i) => {
      const angle = (2 * Math.PI * i) / Math.max(stories.length, 1) - Math.PI / 2;
      const x = 400 + storyRadius * Math.cos(angle);
      const y = 300 + storyRadius * Math.sin(angle);
      const color = CATEGORY_NODE_COLORS[story.category] || "#00d4ff";

      nodes.push({
        id: `story-${story.id}`,
        position: { x, y },
        data: {
          label: (
            <div>
              <div style={{ fontSize: "10px", opacity: 0.7, marginBottom: 2 }}>
                {CATEGORY_LABELS[story.category]}
              </div>
              <div style={{ fontSize: "12px", fontWeight: 600 }}>{story.title}</div>
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

      // Spread topic nodes using force-directed-like layout (M-3)
      const storyAdapted = adapted.filter((a) => a.story_id === story.id);
      const topicCount = storyAdapted.length;
      // Dynamic radius based on count to prevent overlap
      const topicRadius = Math.max(120, Math.min(200, 80 + topicCount * 15));
      // Spread angle evenly across the available arc
      const arcSpread = Math.min(Math.PI * 1.5, topicCount * 0.35);

      storyAdapted.forEach((a, j) => {
        const topic = IELTS_TOPICS.find((t) => t.id === a.topic_id);
        if (!topic) return;

        const tAngle = angle + ((j - (topicCount - 1) / 2) * (arcSpread / Math.max(topicCount - 1, 1)));
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
                {topic.title.length > 30 ? topic.title.slice(0, 28) + "..." : topic.title}
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

    return { initialNodes: nodes, initialEdges: edges };
  }, [stories, adapted]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edgesState, , onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    onNodesChange(initialNodes.map((n) => ({ type: "reset" as const, item: n })));
    onEdgesChange(initialEdges.map((e) => ({ type: "reset" as const, item: e })));
  }, [initialNodes, initialEdges, onNodesChange, onEdgesChange]);

  // Handle node click — navigate to adapt page (M-3)
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.data?.topicId && node.data?.storyId) {
      router.push(`/adapt?topic=${node.data.topicId}&story=${node.data.storyId}`);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="text-2xl font-bold text-gray-100">Mind Map</h1>
        <div className="skeleton mt-6 h-[60vh] w-full" />
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="page-container">
        <h1 className="text-2xl font-bold text-gray-100">Mind Map</h1>
        <p className="mt-2 text-sm text-gray-500">
          Visualize how your stories connect to IELTS topics.
        </p>
        <div className="card mt-6 py-16 text-center">
          <p className="text-lg font-semibold text-gray-300">Nothing to show yet</p>
          <p className="mt-2 text-sm text-gray-500">Add stories and adapt them to see how your corpus grows.</p>
          <a href="/stories" className="btn-neon mt-6 text-xs">Add Stories</a>
        </div>
      </div>
    );
  }

  const totalAdapted = adapted.length;

  return (
    <div className="no-print">
      {/* Page title overlay (m-6) */}
      <div className="absolute left-4 top-[80px] z-10 md:left-6">
        <h1 className="text-lg font-bold text-gray-100">Mind Map</h1>
        <p className="text-xs text-gray-500">
          {stories.length} stories · {totalAdapted} adaptations · Click a topic to view
        </p>
      </div>

      {/* Legend overlay (m-6) */}
      <div className="absolute right-4 top-[80px] z-10 flex flex-wrap gap-2 md:right-6">
        {Object.entries(CATEGORY_NODE_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            <span className="text-[10px] text-gray-500">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}</span>
          </div>
        ))}
      </div>

      <div style={{ width: "100%", height: "calc(100vh - 130px)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edgesState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1a1a2e" />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
