"use client";

import { Suspense } from "react";
import { AdaptContent } from "@/components/AdaptContent";
import { AdaptWorkspaceTabs } from "@/components/AdaptWorkspaceTabs";

export default function AdaptPage() {
  return (
    <>
      <div className="page-container pb-0">
        <AdaptWorkspaceTabs />
      </div>
      <Suspense fallback={<div className="page-container text-gray-500">Loading...</div>}>
        <AdaptContent />
      </Suspense>
    </>
  );
}
