"use client";

import dynamic from "next/dynamic";

const MindMapView = dynamic(() => import("@/components/MindMapView"), { ssr: false });

export default function MindMapPage() {
  return <MindMapView />;
}
