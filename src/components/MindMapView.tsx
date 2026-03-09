"use client";

import { useEffect, useMemo, useState } from "react";
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

const CATEGORY_NODE_COLORS: Record<string, string> = {
  person: "#3b82f6",
  event: "#22c55e",
  object: "#a855f7",
  place: "#f59e0b",
};

export default function MindMapView() {
  const [stories, setStories] = useState<CoreStory[]>([]);
  const [adapted, setAdapted] = useState<AdaptedStory[]>([]);

  useEffect(() => {
    setStories(getStories());
    setAdapted(getAdaptedStories());
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
    const storyRadius = 200;
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
          border: `1px solid ${color}`,
          borderRadius: "10px",
          padding: "8px 14px",
          fontSize: "12px",
          boxShadow: `0 0 10px ${color}33`,
          maxWidth: "160px",
        },
      });

      edges.push({
        id: `center-story-${story.id}`,
        source: "center",
        target: `story-${story.id}`,
        style: { stroke: color, strokeWidth: 2, opacity: 0.5 },
        animated: true,
      });

      // Find topics this story is adapted to
      const storyAdapted = adapted.filter((a) => a.story_id === story.id);
      const topicRadius = 130;

      storyAdapted.forEach((a, j) => {
        const topic = IELTS_TOPICS.find((t) => t.id === a.topic_id);
        if (!topic) return;

        const tAngle = angle + ((j - (storyAdapted.length - 1) / 2) * 0.4);
        const tx = x + topicRadius * Math.cos(tAngle);
        const ty = y + topicRadius * Math.sin(tAngle);
        const tColor = CATEGORY_NODE_COLORS[topic.category] || "#666";

        const nodeId = `topic-${story.id}-${topic.id}`;

        nodes.push({
          id: nodeId,
          position: { x: tx, y: ty },
          data: {
            label: (
              <div style={{ fontSize: "10px" }}>{topic.title}</div>
            ),
          },
          style: {
            background: "#12121a",
            color: tColor,
            border: `1px solid ${tColor}44`,
            borderRadius: "8px",
            padding: "6px 10px",
            maxWidth: "140px",
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

  // Update nodes when data changes
  useEffect(() => {
    onNodesChange(initialNodes.map((n) => ({ type: "reset" as const, item: n })));
    onEdgesChange(initialEdges.map((e) => ({ type: "reset" as const, item: e })));
  }, [initialNodes, initialEdges, onNodesChange, onEdgesChange]);

  if (stories.length === 0) {
    return (
      <div className="page-container">
        <h1 className="text-2xl font-bold text-gray-100">Mind Map</h1>
        <div className="card mt-6 py-16 text-center">
          <p className="text-lg font-semibold text-gray-300">Nothing to show yet</p>
          <p className="mt-2 text-sm text-gray-500">Add stories and adapt them to topics to see the map.</p>
          <a href="/stories" className="btn-neon mt-6 text-xs">Add Stories</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "calc(100vh - 130px)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1a1a2e" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
