import { NextRequest, NextResponse } from "next/server";
import { IELTS_TOPICS } from "@/data/topics";
import { SuggestedTopic, StoryCategory } from "@/lib/types";
import {
  buildUserProviderConfig,
  generateTextWithProviders,
  ProviderError,
} from "@/lib/server/ai-provider";

const SYSTEM_PROMPT = `You are an IELTS Speaking coach helping a learner map one personal story to likely Part 2 cue cards.

Rules:
- Recommend topics that can be answered honestly by reshaping the story, not by inventing new facts.
- Prefer the strongest matches first.
- Keep the list diverse only when the story clearly supports multiple angles.
- Return JSON only with no markdown fences.

Output schema:
{
  "suggestions": [
    { "id": "p1", "reason": "short reason" },
    { "id": "e4", "reason": "short reason" }
  ]
}`;

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "had",
  "has",
  "have",
  "how",
  "i",
  "in",
  "is",
  "it",
  "its",
  "my",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "there",
  "they",
  "this",
  "to",
  "was",
  "were",
  "when",
  "where",
  "who",
  "why",
  "with",
  "you",
  "your",
]);

function stripFenceWrapper(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
}

function extractJsonObject(value: string): string | null {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start === -1 || end <= start) {
    return null;
  }

  return value.slice(start, end + 1).trim();
}

function parseSuggestionIds(raw: string): { id: string; reason: string }[] {
  const candidates = [raw, stripFenceWrapper(raw), extractJsonObject(raw) || ""]
    .map((value) => value.trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const items: unknown[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.suggestions)
        ? parsed.suggestions
        : Array.isArray(parsed?.topic_ids)
        ? parsed.topic_ids
        : [];

      const normalized = items
        .map((item): { id: string; reason: string } | null => {
          if (typeof item === "string") {
            return { id: item.trim(), reason: "" };
          }

          if (item && typeof item === "object") {
            const id = String((item as { id?: unknown; topic_id?: unknown }).id ?? (item as { topic_id?: unknown }).topic_id ?? "").trim();
            if (!id) {
              return null;
            }

            const reason = String((item as { reason?: unknown }).reason ?? "").trim();
            return { id, reason };
          }

          return null;
        })
        .filter((item): item is { id: string; reason: string } => !!item);

      if (normalized.length > 0) {
        return normalized;
      }
    } catch {
      continue;
    }
  }

  return [];
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function heuristicSuggestions(story: string, storyCategory: StoryCategory | undefined, limit: number): SuggestedTopic[] {
  const storyTokens = new Set(tokenize(story));

  return IELTS_TOPICS
    .map((topic) => {
      const topicTokens = tokenize(`${topic.title} ${topic.cue_card}`);
      let score = topicTokens.reduce((sum, token) => sum + (storyTokens.has(token) ? 1 : 0), 0);
      if (storyCategory && topic.category === storyCategory) {
        score += 3;
      }

      return {
        topic,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ topic }) => ({
      id: topic.id,
      title: topic.title,
      category: topic.category,
      cue_card: topic.cue_card,
      reason: storyCategory === topic.category ? "Same core story category." : "Strong keyword overlap with your story.",
    }));
}

function buildSuggestionResponse(
  story: string,
  storyCategory: StoryCategory | undefined,
  limit: number,
  aiSuggestions: { id: string; reason: string }[] = []
) {
  const fallback = heuristicSuggestions(story, storyCategory, limit);
  return {
    suggestions: mergeSuggestions(aiSuggestions, fallback, limit),
  };
}

function buildTopicCatalog(): string {
  return IELTS_TOPICS.map(
    (topic) =>
      `${topic.id} | ${topic.category} | ${topic.title} | ${topic.cue_card.replace(/\n/g, " ")}`
  ).join("\n");
}

function mergeSuggestions(
  aiSuggestions: { id: string; reason: string }[],
  fallbackSuggestions: SuggestedTopic[],
  limit: number
): SuggestedTopic[] {
  const byId = new Map<string, SuggestedTopic>();

  for (const item of aiSuggestions) {
    const topic = IELTS_TOPICS.find((candidate) => candidate.id === item.id);
    if (!topic || byId.has(topic.id)) {
      continue;
    }

    byId.set(topic.id, {
      id: topic.id,
      title: topic.title,
      category: topic.category,
      cue_card: topic.cue_card,
      reason: item.reason || "Recommended by AI based on your story.",
    });
  }

  for (const item of fallbackSuggestions) {
    if (byId.size >= limit) {
      break;
    }

    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }

  return Array.from(byId.values()).slice(0, limit);
}

export async function POST(req: NextRequest) {
  try {
    const {
      story,
      storyCategory,
      limit = 8,
      userApiKey,
      userProvider,
    } = await req.json();

    if (!story || typeof story !== "string") {
      return NextResponse.json({ error: "Missing story" }, { status: 400 });
    }

    const cappedLimit = Math.max(3, Math.min(Number(limit) || 8, 12));
    const userPrompt = `## Story
${story}

## Available IELTS Topics
${buildTopicCatalog()}

Return the ${cappedLimit} best topic IDs for this story.`;

    const userConfig = buildUserProviderConfig(userApiKey, userProvider);
    try {
      const raw = await generateTextWithProviders(SYSTEM_PROMPT, userPrompt, userConfig);
      const aiSuggestions = parseSuggestionIds(raw);

      return NextResponse.json(
        buildSuggestionResponse(
          story,
          storyCategory as StoryCategory | undefined,
          cappedLimit,
          aiSuggestions
        )
      );
    } catch (error) {
      if (error instanceof ProviderError && error.code === "INVALID_KEY") {
        return NextResponse.json(
          { error: "Invalid API key", code: "INVALID_KEY" },
          { status: 401 }
        );
      }

      console.error("Suggest topics AI failed, falling back to heuristic ranking:", error);
      return NextResponse.json(
        buildSuggestionResponse(
          story,
          storyCategory as StoryCategory | undefined,
          cappedLimit
        )
      );
    }
  } catch (error) {
    console.error("Suggest topics error:", error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
