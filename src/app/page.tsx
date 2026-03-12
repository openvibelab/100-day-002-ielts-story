"use client";

import Link from "next/link";
import { BookOpen, Brain, Network, Sparkles, Layers, FileText } from "lucide-react";
import { ProgressSummary } from "@/components/ProgressSummary";
import { useLang } from "@/lib/LangContext";
import { ts, TranslationKey } from "@/lib/i18n";

export default function Home() {
  const { locale } = useLang();

  const features: { icon: typeof BookOpen; titleKey: TranslationKey; descKey: TranslationKey; href: string }[] = [
    { icon: BookOpen, titleKey: "homeWriteStories", descKey: "homeWriteStoriesDesc", href: "/stories" },
    { icon: Brain, titleKey: "home140Topics", descKey: "home140TopicsDesc", href: "/topics" },
    { icon: Sparkles, titleKey: "homeAIAdapt", descKey: "homeAIAdaptDesc", href: "/adapt" },
    { icon: Layers, titleKey: "homeBatchAdapt", descKey: "homeBatchAdaptDesc", href: "/batch" },
    { icon: Network, titleKey: "homeMindMap", descKey: "homeMindMapDesc", href: "/mind-map" },
    { icon: FileText, titleKey: "homeCorpus", descKey: "homeCorpusDesc", href: "/corpus" },
  ];

  return (
    <div className="page-container">
      <div className="mx-auto max-w-3xl py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-100 md:text-5xl">
          {ts("homeTitle1", locale)}<br />
          <span className="accent-text">{ts("homeTitle2", locale)}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-warm-secondary">
          {ts("homeDesc", locale)}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/adapt" className="btn-accent-solid">
            <Sparkles size={16} />
            {ts("homeGetStarted", locale)}
          </Link>
          <Link href="/corpus" className="btn-ghost">
            {ts("homeBrowseTopics", locale)}
          </Link>
        </div>
      </div>

      <ProgressSummary />

      <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((item) => (
          <Link key={item.href} href={item.href} className="card-hover group">
            <item.icon
              size={24}
              className="text-amber-400 transition-all group-hover:drop-shadow-[0_0_8px_rgba(232,164,74,0.5)]"
            />
            <h3 className="mt-3 text-sm font-semibold text-warm-text">{ts(item.titleKey, locale)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{ts(item.descKey, locale)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
