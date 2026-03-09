import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(req: NextRequest) {
  try {
    const { story, topic, cue_card } = await req.json();

    if (!story || !topic || !cue_card) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const systemPrompt = `You are an expert IELTS Speaking coach. Your task is to take a student's personal story and adapt it to answer a specific IELTS Speaking Part 2 cue card.

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

    const userPrompt = `## My Personal Story
${story}

## IELTS Cue Card: ${topic}
${cue_card}

Please adapt my personal story to answer this cue card naturally.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
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
      const detail = await res.text().catch(() => "");
      console.error("Gemini error:", res.status, detail);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p?.text || "").join("") || "";

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ adapted_content: text, tips: "" });
    }
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
