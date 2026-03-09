"use client";

import { Suspense } from "react";
import { AdaptContent } from "@/components/AdaptContent";

export default function AdaptPage() {
  return (
    <Suspense fallback={<div className="page-container text-gray-500">Loading...</div>}>
      <AdaptContent />
    </Suspense>
  );
}
