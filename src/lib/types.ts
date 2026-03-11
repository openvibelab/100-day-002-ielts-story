export type StoryCategory = "person" | "event" | "object" | "place";

export interface CoreStory {
  id: string;
  title: string;
  category: StoryCategory;
  content: string;
  created_at: string;
}

export interface IELTSTopic {
  id: string;
  title: string;
  category: StoryCategory;
  cue_card: string;
  source?: string;
}

export interface AdaptedStory {
  id: string;
  story_id: string;
  topic_id: string;
  adapted_content: string;
  tips: string;
  created_at: string;
}

export interface SuggestedTopic {
  id: string;
  title: string;
  category: StoryCategory;
  cue_card: string;
  reason: string;
}

export const CATEGORY_LABELS: Record<StoryCategory, string> = {
  person: "Person",
  event: "Event",
  object: "Object",
  place: "Place",
};

export const CATEGORY_COLORS: Record<StoryCategory, string> = {
  person: "tag-person",
  event: "tag-event",
  object: "tag-object",
  place: "tag-place",
};
