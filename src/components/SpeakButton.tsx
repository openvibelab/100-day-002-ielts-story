"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, Square } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import { ts } from "@/lib/i18n";

interface SpeakButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "md";
}

export function SpeakButton({ text, className = "", size = "sm" }: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { locale } = useLang();

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    return () => {
      if (speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speaking]);

  function handleSpeak() {
    if (!supported) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Female")
    ) || voices.find(
      (v) => v.lang.startsWith("en-")
    );
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  if (!supported) return null;

  const iconSize = size === "sm" ? 12 : 14;

  return (
    <button
      onClick={handleSpeak}
      className={`inline-flex items-center gap-1.5 rounded-lg border transition-all ${
        speaking
          ? "border-amber-400/50 bg-amber-500/10 text-amber-400"
          : "border-dark-border text-warm-secondary hover:border-gray-500 hover:text-warm-text"
      } ${size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-xs"} ${className}`}
      aria-label={speaking ? ts("speakStop", locale) : ts("speakListen", locale)}
      title={speaking ? ts("speakStop", locale) : ts("speakListen", locale)}
    >
      {speaking ? <Square size={iconSize} /> : <Volume2 size={iconSize} />}
      {speaking ? ts("speakStop", locale) : ts("speakListen", locale)}
    </button>
  );
}
