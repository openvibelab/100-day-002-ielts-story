import { CoreStory, AdaptedStory } from "./types";

const STORIES_KEY = "ielts_core_stories";
const ADAPTED_KEY = "ielts_adapted_stories";

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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

export function deleteStory(id: string): void {
  const stories = getStories().filter((s) => s.id !== id);
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  // Also delete adapted stories for this story
  const adapted = getAdaptedStories().filter((a) => a.story_id !== id);
  localStorage.setItem(ADAPTED_KEY, JSON.stringify(adapted));
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
  // Replace if exists
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
