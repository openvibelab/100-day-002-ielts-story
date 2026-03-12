"use client";

import { useState, useEffect } from "react";
import { KeyRound, Check, Trash2 } from "lucide-react";
import {
  getUserApiKey,
  getUserProvider,
  saveUserApiKey,
  clearUserApiKey,
  hasUserApiKey,
  type AIProvider,
} from "@/lib/ai";
import { useLang } from "@/lib/LangContext";
import { ts } from "@/lib/i18n";

const PROVIDER_LABELS: Record<AIProvider, string> = {
  gemini: "Gemini",
  deepseek: "DeepSeek",
  openai: "OpenAI",
};

interface ApiKeySetupProps {
  show: boolean;
  onConfigChange?: (configured: boolean, provider: AIProvider) => void;
}

export function ApiKeySetup({ show, onConfigChange }: ApiKeySetupProps) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiProvider, setApiProvider] = useState<AIProvider>("gemini");
  const [apiConfigured, setApiConfigured] = useState(false);
  const [apiSaveSuccess, setApiSaveSuccess] = useState(false);
  const { locale } = useLang();

  useEffect(() => {
    if (hasUserApiKey()) {
      setApiConfigured(true);
      setApiKeyInput(getUserApiKey());
      setApiProvider(getUserProvider());
    }
  }, []);

  function handleSave() {
    if (!apiKeyInput.trim()) return;
    saveUserApiKey(apiKeyInput.trim(), apiProvider);
    setApiConfigured(true);
    setApiSaveSuccess(true);
    onConfigChange?.(true, apiProvider);
    setTimeout(() => setApiSaveSuccess(false), 2000);
  }

  function handleClear() {
    clearUserApiKey();
    setApiKeyInput("");
    setApiProvider("gemini");
    setApiConfigured(false);
    setApiSaveSuccess(false);
    onConfigChange?.(false, "gemini");
  }

  if (!show) return null;

  return (
    <div className="card mt-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-warm-text">
          <KeyRound size={14} />
          {ts("apiKeyTitle", locale)}
        </h3>
        {apiSaveSuccess && (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <Check size={12} /> {ts("apiKeySaved", locale)}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {ts("apiKeyDesc", locale)}
      </p>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-warm-secondary">{ts("apiKeyProvider", locale)}</p>
        <div className="flex gap-2">
          {(Object.keys(PROVIDER_LABELS) as AIProvider[]).map((p) => (
            <button
              key={p}
              onClick={() => setApiProvider(p)}
              className={`rounded-lg border px-4 py-2 text-xs font-medium transition-all ${
                apiProvider === p
                  ? "border-amber-400 bg-amber-500/10 text-amber-400"
                  : "border-dark-border bg-dark-card text-warm-secondary hover:border-gray-500"
              }`}
            >
              {PROVIDER_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="api-key-input" className="mb-2 block text-xs font-medium text-warm-secondary">
          {ts("apiKeyLabel", locale)}
        </label>
        <input
          id="api-key-input"
          type="password"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder={`Enter your ${PROVIDER_LABELS[apiProvider]} API key...`}
          className="input-dark"
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          className="btn-accent text-xs"
          onClick={handleSave}
          disabled={!apiKeyInput.trim()}
        >
          <Check size={14} /> {ts("apiKeySave", locale)}
        </button>
        {apiConfigured && (
          <button
            className="btn-ghost text-xs text-red-400"
            onClick={handleClear}
            aria-label={ts("apiKeyClear", locale)}
          >
            <Trash2 size={14} /> {ts("apiKeyClear", locale)}
          </button>
        )}
      </div>
    </div>
  );
}

export function ApiKeyBadge() {
  const [configured, setConfigured] = useState(false);
  const [provider, setProvider] = useState<AIProvider>("gemini");

  useEffect(() => {
    if (hasUserApiKey()) {
      setConfigured(true);
      setProvider(getUserProvider());
    }
  }, []);

  if (!configured) return null;

  return (
    <span className="flex items-center gap-1 text-xs text-green-400">
      <KeyRound size={12} />
      {PROVIDER_LABELS[provider]}
    </span>
  );
}
