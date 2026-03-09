import { CoreStory, AdaptedStory } from "./types";

const STORIES_KEY = "ielts_core_stories";
const ADAPTED_KEY = "ielts_adapted_stories";
const BATCH_STATE_KEY = "ielts_batch_state";
const DATA_VERSION_KEY = "ielts_data_version";
const CURRENT_VERSION = 1;

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}-${Math.random().toString(36).slice(2, 5)}`;
}

// Data version migration
export function ensureDataVersion(): void {
  if (typeof window === "undefined") return;
  const v = parseInt(localStorage.getItem(DATA_VERSION_KEY) || "0", 10);
  if (v < CURRENT_VERSION) {
    localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_VERSION));
  }
}

// Core Stories
export function getStories(): CoreStory[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORIES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveStory(story: Omit<CoreStory, "id" | "created_at">): CoreStory {
  const stories = getStories();
  const newStory: CoreStory = {
    ...story,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  stories.push(newStory);
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  return newStory;
}

export function updateStory(id: string, updates: Partial<CoreStory>): void {
  const stories = getStories();
  const index = stories.findIndex((s) => s.id === id);
  if (index !== -1) {
    stories[index] = { ...stories[index], ...updates };
    localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  }
}

export function deleteStory(id: string): number {
  const stories = getStories().filter((s) => s.id !== id);
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  const allAdapted = getAdaptedStories();
  const remaining = allAdapted.filter((a) => a.story_id !== id);
  const deletedCount = allAdapted.length - remaining.length;
  localStorage.setItem(ADAPTED_KEY, JSON.stringify(remaining));
  return deletedCount;
}

// Adapted Stories
export function getAdaptedStories(): AdaptedStory[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ADAPTED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getAdaptedStory(storyId: string, topicId: string): AdaptedStory | null {
  return getAdaptedStories().find((a) => a.story_id === storyId && a.topic_id === topicId) || null;
}

export function saveAdaptedStory(adapted: Omit<AdaptedStory, "id" | "created_at">): AdaptedStory {
  const all = getAdaptedStories();
  const existing = all.findIndex((a) => a.story_id === adapted.story_id && a.topic_id === adapted.topic_id);
  const newAdapted: AdaptedStory = {
    ...adapted,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  if (existing !== -1) {
    all[existing] = newAdapted;
  } else {
    all.push(newAdapted);
  }
  localStorage.setItem(ADAPTED_KEY, JSON.stringify(all));
  return newAdapted;
}

export function getAdaptedCountByStory(storyId: string): number {
  return getAdaptedStories().filter((a) => a.story_id === storyId).length;
}

export function getAdaptedCountByTopic(topicId: string): number {
  return getAdaptedStories().filter((a) => a.topic_id === topicId).length;
}

export function updateAdaptedContent(id: string, content: string): void {
  const all = getAdaptedStories();
  const index = all.findIndex((a) => a.id === id);
  if (index !== -1) {
    all[index] = { ...all[index], adapted_content: content };
    localStorage.setItem(ADAPTED_KEY, JSON.stringify(all));
  }
}

export function deleteAdaptedStory(id: string): void {
  const all = getAdaptedStories().filter((a) => a.id !== id);
  localStorage.setItem(ADAPTED_KEY, JSON.stringify(all));
}

// Batch state persistence (C-3)
export interface BatchState {
  storyId: string;
  topicIds: string[];
  completedTopicIds: string[];
  failedTopicIds: string[];
  timestamp: string;
}

export function saveBatchState(state: BatchState): void {
  localStorage.setItem(BATCH_STATE_KEY, JSON.stringify(state));
}

export function getBatchState(): BatchState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BATCH_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearBatchState(): void {
  localStorage.removeItem(BATCH_STATE_KEY);
}

// JSON export/import (C-2)
export interface ExportData {
  version: number;
  exported_at: string;
  stories: CoreStory[];
  adapted_stories: AdaptedStory[];
}

export function exportAllData(): ExportData {
  return {
    version: CURRENT_VERSION,
    exported_at: new Date().toISOString(),
    stories: getStories(),
    adapted_stories: getAdaptedStories(),
  };
}

export function importAllData(data: ExportData): { stories: number; adapted: number } {
  const stories = data.stories || [];
  const adapted = data.adapted_stories || [];
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  localStorage.setItem(ADAPTED_KEY, JSON.stringify(adapted));
  localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_VERSION));
  return { stories: stories.length, adapted: adapted.length };
}

export function getStorageStats(): { stories: number; adapted: number; sizeKB: number } {
  const stories = getStories();
  const adapted = getAdaptedStories();
  const size =
    (localStorage.getItem(STORIES_KEY) || "").length +
    (localStorage.getItem(ADAPTED_KEY) || "").length;
  return {
    stories: stories.length,
    adapted: adapted.length,
    sizeKB: Math.round(size / 1024),
  };
}
