import Link from "next/link";
import { BookOpen, Brain, Network, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="page-container">
      <div className="mx-auto max-w-3xl py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-100 md:text-5xl">
          One story.<br />
          <span className="neon-text">Every topic.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-400">
          Write a few personal core stories, then let AI adapt them to fit any IELTS Speaking Part 2 topic. Practice smarter, not harder.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/stories" className="btn-neon-solid">
            <Sparkles size={16} />
            Get Started
          </Link>
          <Link href="/topics" className="btn-ghost">
            Browse Topics
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: BookOpen,
            title: "Write Stories",
            desc: "Input your real personal stories — a trip, a friend, a meaningful object.",
            href: "/stories",
          },
          {
            icon: Brain,
            title: "140+ Topics",
            desc: "Browse the full IELTS Part 2 topic bank (2026 Jan-Apr), organized by category.",
            href: "/topics",
          },
          {
            icon: Sparkles,
            title: "AI Adapt",
            desc: "Pick a story + topic. AI rewrites your story to answer that cue card.",
            href: "/adapt",
          },
          {
            icon: Network,
            title: "Mind Map",
            desc: "Visualize which stories cover which topics. Find gaps at a glance.",
            href: "/mind-map",
          },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card-hover group">
            <item.icon
              size={24}
              className="text-neon-blue transition-all group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]"
            />
            <h3 className="mt-3 text-sm font-semibold text-gray-200">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
