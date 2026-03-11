import { NextRequest, NextResponse } from "next/server";
import { toAdaptedResult } from "@/lib/adapted-result";
import {
  buildUserProviderConfig,
  generateTextWithProviders,
  ProviderError,
} from "@/lib/server/ai-provider";

const SYSTEM_PROMPT = `You are an expert IELTS Speaking coach. Your task is to take a student's personal story and adapt it to answer a specific IELTS Speaking Part 2 cue card.

Rules:
- Keep the story personal and authentic - do not invent new facts, just reshape and emphasize different parts
- The adapted story must naturally address all bullet points on the cue card
- Use natural spoken English (Band 7-8 level), not overly formal or academic
- Include useful vocabulary and idiomatic expressions naturally
- The response should be 250-350 words (about 2 minutes of speaking)
- Add smooth transitions between points
- Return JSON only, with no markdown fences and no extra commentary

Output strict JSON only:
{
  "adapted_content": "The full adapted story as a speaking response",
  "tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ]
}`;

function buildUserPrompt(story: string, topic: string, cueCard: string): string {
  return `## My Personal Story
${story}

## IELTS Cue Card: ${topic}
${cueCard}

Please adapt my personal story to answer this cue card naturally.`;
}

export async function POST(req: NextRequest) {
  try {
    const { story, topic, cue_card, userApiKey, userProvider } = await req.json();

    if (!story || !topic || !cue_card) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof story !== "string" || story.length > 5000) {
      return NextResponse.json({ error: "Story too long (max 5000 chars)" }, { status: 400 });
    }

    const userPrompt = buildUserPrompt(story, topic, cue_card);
    const userConfig = buildUserProviderConfig(userApiKey, userProvider);
    const text = await generateTextWithProviders(SYSTEM_PROMPT, userPrompt, userConfig);

    return NextResponse.json(toAdaptedResult(text));
  } catch (error) {
    if (error instanceof ProviderError) {
      if (error.code === "QUOTA_EXCEEDED") {
        return NextResponse.json(
          { error: "All API quotas exceeded. Please configure your own API key.", code: "QUOTA_EXCEEDED" },
          { status: 429 }
        );
      }

      if (error.code === "INVALID_KEY") {
        return NextResponse.json(
          { error: "Invalid API key", code: "INVALID_KEY" },
          { status: 401 }
        );
      }
    }

    console.error("Generate error:", error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
