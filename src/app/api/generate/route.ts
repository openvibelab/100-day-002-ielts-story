import { NextRequest, NextResponse } from "next/server";

type AIProvider = "gemini" | "deepseek" | "openai";

interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

const SYSTEM_PROMPT = `You are an expert IELTS Speaking coach. Your task is to take a student's personal story and adapt it to answer a specific IELTS Speaking Part 2 cue card.

Rules:
- Keep the story personal and authentic — don't invent new facts, just reshape and emphasize different parts
- The adapted story must naturally address ALL bullet points on the cue card
- Use natural spoken English (Band 7-8 level), not overly formal or academic
- Include useful vocabulary and idiomatic expressions naturally
- The response should be 250-350 words (about 2 minutes of speaking)
- Add smooth transitions between points

Output strict JSON only:
{
  "adapted_content": "The full adapted story as a speaking response",
  "tips": "3-5 bullet points with specific tips for delivering this adapted version (vocabulary highlights, what to emphasize, potential follow-up questions)"
}`;

function buildUserPrompt(story: string, topic: string, cueCard: string): string {
  return `## My Personal Story
${story}

## IELTS Cue Card: ${topic}
${cueCard}

Please adapt my personal story to answer this cue card naturally.`;
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
    if (status === 429) throw { code: "QUOTA_EXCEEDED", message: "Gemini quota exceeded" };
    if (status === 401 || status === 403) throw { code: "INVALID_KEY", message: "Invalid Gemini API key" };
    throw new Error(`Gemini error ${status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p?.text || "")
      .join("") || "";
  return text;
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
    if (status === 429) throw { code: "QUOTA_EXCEEDED", message: "API quota exceeded" };
    if (status === 401 || status === 403) throw { code: "INVALID_KEY", message: "Invalid API key" };
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

function getModelForProvider(provider: AIProvider): string {
  switch (provider) {
    case "gemini":
      return "gemini-2.5-flash";
    case "deepseek":
      return "deepseek-chat";
    case "openai":
      return "gpt-4o-mini";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { story, topic, cue_card, userApiKey, userProvider } = await req.json();

    if (!story || !topic || !cue_card) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Server-side input validation
    if (typeof story !== "string" || story.length > 5000) {
      return NextResponse.json({ error: "Story too long (max 5000 chars)" }, { status: 400 });
    }

    const userPrompt = buildUserPrompt(story, topic, cue_card);

    // If user provides their own key, use ONLY that provider
    if (userApiKey && userProvider) {
      const config: ProviderConfig = {
        provider: userProvider as AIProvider,
        apiKey: userApiKey,
        model: getModelForProvider(userProvider as AIProvider),
      };

      try {
        const text = await callProvider(config, SYSTEM_PROMPT, userPrompt);
        try {
          const parsed = JSON.parse(text);
          return NextResponse.json(parsed);
        } catch {
          return NextResponse.json({ adapted_content: text, tips: "" });
        }
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (error.code === "QUOTA_EXCEEDED") {
          return NextResponse.json(
            { error: "API quota exceeded", code: "QUOTA_EXCEEDED" },
            { status: 429 }
          );
        }
        if (error.code === "INVALID_KEY") {
          return NextResponse.json(
            { error: "Invalid API key", code: "INVALID_KEY" },
            { status: 401 }
          );
        }
        throw err;
      }
    }

    // Server-side: try providers in order
    const serverProviders = getServerProviders();

    if (serverProviders.length === 0) {
      return NextResponse.json({ error: "No API keys configured" }, { status: 500 });
    }

    let lastError: unknown = null;

    for (const config of serverProviders) {
      try {
        const text = await callProvider(config, SYSTEM_PROMPT, userPrompt);
        try {
          const parsed = JSON.parse(text);
          return NextResponse.json(parsed);
        } catch {
          return NextResponse.json({ adapted_content: text, tips: "" });
        }
      } catch (err: unknown) {
        console.error(`Provider ${config.provider} failed:`, err);
        lastError = err;
        // Continue to next provider
      }
    }

    // All providers failed
    const error = lastError as { code?: string; message?: string } | undefined;
    if (error?.code === "QUOTA_EXCEEDED") {
      return NextResponse.json(
        { error: "All API quotas exceeded. Please configure your own API key.", code: "QUOTA_EXCEEDED" },
        { status: 429 }
      );
    }

    const errorMsg = error?.message || String(lastError) || "Unknown error";
    console.error("All providers failed. Last error:", errorMsg);
    return NextResponse.json({ error: `AI service error: ${errorMsg}` }, { status: 502 });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: `Server error: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
  }
}
