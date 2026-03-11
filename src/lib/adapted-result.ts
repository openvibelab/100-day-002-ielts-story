export interface AdaptedResult {
  adapted_content: string;
  tips: string;
}

type JsonRecord = Record<string, unknown>;

const FENCED_BLOCK_RE = /```(?:json)?\s*([\s\S]*?)\s*```/gi;

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

function stripFenceWrapper(value: string): string {
  const trimmed = normalizeLineEndings(value);
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

function looksLikeJsonFragment(value: string): boolean {
  const trimmed = value.trim();
  return !trimmed.startsWith("{") && trimmed.includes("\"adapted_content\"") && trimmed.includes(":");
}

function collectJsonCandidates(raw: string): string[] {
  const candidates = new Set<string>();
  const trimmed = normalizeLineEndings(raw);

  if (!trimmed) {
    return [];
  }

  const addCandidate = (value: string | null | undefined) => {
    const normalized = value ? normalizeLineEndings(value) : "";
    if (normalized) {
      candidates.add(normalized);
    }
  };

  addCandidate(trimmed);
  addCandidate(stripFenceWrapper(trimmed));

  const fencedBlockRe = new RegExp(FENCED_BLOCK_RE);
  let match: RegExpExecArray | null = fencedBlockRe.exec(trimmed);

  while (match) {
    addCandidate(match[1]);
    match = fencedBlockRe.exec(trimmed);
  }

  const objectCandidate = extractJsonObject(trimmed);
  addCandidate(objectCandidate);
  addCandidate(objectCandidate ? stripFenceWrapper(objectCandidate) : "");

  if (looksLikeJsonFragment(trimmed)) {
    addCandidate(`{${trimmed.replace(/^[,\s]+|[,\s]+$/g, "")}}`);
  }

  return Array.from(candidates);
}

function parseJsonCandidate(candidate: string): unknown | null {
  const attempts = [candidate, candidate.replace(/,\s*([}\]])/g, "$1")];

  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt);
    } catch {
      continue;
    }
  }

  return null;
}

function normalizeTextValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeTextValue(item))
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  return "";
}

function normalizeTipItem(value: unknown): string {
  if (typeof value === "string") {
    return value.trim().replace(/^\s*[-*•]\s*/, "");
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeTipItem(item))
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  if (value && typeof value === "object") {
    const record = value as JsonRecord;
    const preferredFields = [
      "title",
      "label",
      "tip",
      "content",
      "text",
      "value",
      "description",
    ];

    const preferred = preferredFields
      .map((field) => normalizeTextValue(record[field]))
      .filter(Boolean);

    if (preferred.length > 0) {
      return preferred.join(": ");
    }

    return Object.values(record)
      .map((item) => normalizeTipItem(item))
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  return "";
}

function normalizeTips(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  const items = Array.isArray(value)
    ? value.map((item) => normalizeTipItem(item)).filter(Boolean)
    : value && typeof value === "object"
    ? Object.values(value as JsonRecord).map((item) => normalizeTipItem(item)).filter(Boolean)
    : [];

  if (items.length === 0) {
    return "";
  }

  return items
    .map((item) => (item.match(/^[-*•]\s/) ? item : `- ${item}`))
    .join("\n");
}

function normalizeObjectResult(value: JsonRecord): AdaptedResult | null {
  const tips =
    normalizeTips(
      value.tips ??
        value.tip_list ??
        value.delivery_tips ??
        value.notes ??
        value.advice
    ) || "";

  const adaptedValue =
    value.adapted_content ??
    value.adaptedContent ??
    value.content ??
    value.answer ??
    value.response ??
    value.script;

  if (typeof adaptedValue === "string") {
    const nested = parseAdaptedResult(adaptedValue);
    if (nested) {
      return {
        adapted_content: nested.adapted_content,
        tips: tips || nested.tips,
      };
    }
  }

  const adaptedContent = normalizeTextValue(adaptedValue);
  if (!adaptedContent) {
    return null;
  }

  return {
    adapted_content: adaptedContent,
    tips,
  };
}

export function parseAdaptedResult(raw: string): AdaptedResult | null {
  for (const candidate of collectJsonCandidates(raw)) {
    const parsed = parseJsonCandidate(candidate);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      continue;
    }

    const normalized = normalizeObjectResult(parsed as JsonRecord);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export function toAdaptedResult(value: unknown): AdaptedResult {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const normalized = normalizeObjectResult(value as JsonRecord);
    if (normalized) {
      return normalized;
    }
  }

  if (typeof value === "string") {
    const parsed = parseAdaptedResult(value);
    if (parsed) {
      return parsed;
    }

    return {
      adapted_content: stripFenceWrapper(value),
      tips: "",
    };
  }

  return {
    adapted_content: "",
    tips: "",
  };
}
