import "server-only";

export type AIProvider = "gemini" | "deepseek" | "openai";

export interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export class ProviderError extends Error {
  code?: "QUOTA_EXCEEDED" | "INVALID_KEY";

  constructor(message: string, code?: "QUOTA_EXCEEDED" | "INVALID_KEY") {
    super(message);
    this.name = "ProviderError";
    this.code = code;
  }
}

async function callGemini(apiKey: string, model: string, systemPrompt: string, userPrompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.6,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  if (!res.ok) {
    const status = res.status;
    const detail = await res.text().catch(() => "");
    console.error("Gemini error:", status, detail);
    if (status === 429) throw new ProviderError("Gemini quota exceeded", "QUOTA_EXCEEDED");
    if (status === 401 || status === 403) throw new ProviderError("Invalid Gemini API key", "INVALID_KEY");
    throw new Error(`Gemini error ${status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part?.text || "")
      .join("") || ""
  );
}

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  useJsonFormat: boolean
) {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.6,
    max_tokens: 2000,
  };

  if (useJsonFormat) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const status = res.status;
    const detail = await res.text().catch(() => "");
    console.error(`OpenAI-compatible error (${baseUrl}):`, status, detail);
    if (status === 429) throw new ProviderError("API quota exceeded", "QUOTA_EXCEEDED");
    if (status === 401 || status === 403) throw new ProviderError("Invalid API key", "INVALID_KEY");
    throw new Error(`API error: ${status}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callProvider(config: ProviderConfig, systemPrompt: string, userPrompt: string): Promise<string> {
  switch (config.provider) {
    case "gemini":
      return callGemini(config.apiKey, config.model, systemPrompt, userPrompt);
    case "deepseek":
      return callOpenAICompatible(
        "https://api.deepseek.com",
        config.apiKey,
        config.model,
        systemPrompt,
        userPrompt,
        false
      );
    case "openai":
      return callOpenAICompatible(
        "https://api.openai.com",
        config.apiKey,
        config.model,
        systemPrompt,
        userPrompt,
        true
      );
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

function getServerProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  if (process.env.GEMINI_API_KEY) {
    providers.push({
      provider: "gemini",
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });
  }

  if (process.env.DEEPSEEK_API_KEY) {
    providers.push({
      provider: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: "deepseek-chat",
    });
  }

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
    });
  }

  return providers;
}

export function getModelForProvider(provider: AIProvider): string {
  switch (provider) {
    case "gemini":
      return "gemini-2.5-flash";
    case "deepseek":
      return "deepseek-chat";
    case "openai":
      return "gpt-4o-mini";
  }
}

export function buildUserProviderConfig(
  userApiKey?: string,
  userProvider?: string
): ProviderConfig | null {
  if (!userApiKey || !userProvider) {
    return null;
  }

  return {
    provider: userProvider as AIProvider,
    apiKey: userApiKey,
    model: getModelForProvider(userProvider as AIProvider),
  };
}

export async function generateTextWithProviders(
  systemPrompt: string,
  userPrompt: string,
  userConfig?: ProviderConfig | null
): Promise<string> {
  if (userConfig) {
    return callProvider(userConfig, systemPrompt, userPrompt);
  }

  const serverProviders = getServerProviders();
  if (serverProviders.length === 0) {
    throw new Error("No API keys configured");
  }

  let lastError: unknown = null;
  for (const config of serverProviders) {
    try {
      return await callProvider(config, systemPrompt, userPrompt);
    } catch (error) {
      console.error(`Provider ${config.provider} failed:`, error);
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
