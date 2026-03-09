"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { CoreStory, StoryCategory, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import { getStories, saveStory, updateStory, deleteStory, getAdaptedCountByStory } from "@/lib/store";

const CATEGORIES: StoryCategory[] = ["person", "event", "object", "place"];

export default function StoriesPage() {
  const [stories, setStories] = useState<CoreStory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<StoryCategory>("event");
  const [content, setContent] = useState("");

  useEffect(() => {
    setStories(getStories());
  }, []);

  function handleSave() {
    if (!title.trim() || !content.trim()) return;

    if (editingId) {
      updateStory(editingId, { title: title.trim(), category, content: content.trim() });
      setEditingId(null);
    } else {
      saveStory({ title: title.trim(), category, content: content.trim() });
    }

    setStories(getStories());
    resetForm();
  }

  function handleEdit(story: CoreStory) {
    setTitle(story.title);
    setCategory(story.category);
    setContent(story.content);
    setEditingId(story.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    deleteStory(id);
    setStories(getStories());
  }

  function resetForm() {
    setTitle("");
    setCategory("event");
    setContent("");
    setShowForm(false);
    setEditingId(null);
  }

  return (
    <div className="page-container">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">My Core Stories</h1>
          <p className="mt-2 text-sm text-gray-500">
            Write your real experiences. These will be adapted to fit different IELTS topics.
          </p>
        </div>
        <button className="btn-neon" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} />
          Add Story
        </button>
      </div>

      {showForm && (
        <div className="card mt-6">
          <h3 className="text-sm font-semibold text-gray-200">
            {editingId ? "Edit Story" : "New Core Story"}
          </h3>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your story a short title (e.g. 'Trip to Beijing')"
            className="input-dark mt-4"
            maxLength={100}
          />

          <div className="mt-4">
            <p className="mb-2 text-xs text-gray-500">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === cat
                      ? "border-neon-blue bg-neon-blue/10 text-neon-blue"
                      : "border-dark-border text-gray-500 hover:border-gray-500 hover:text-gray-300"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your story in detail. Include who was involved, what happened, how you felt, and why it matters to you. The more detail, the better AI can adapt it."
            className="textarea-dark mt-4 min-h-[200px]"
            maxLength={3000}
          />
          <div className="mt-1 text-right text-xs text-gray-600">{content.length}/3000</div>

          <div className="mt-4 flex gap-3">
            <button className="btn-neon-solid" onClick={handleSave} disabled={!title.trim() || !content.trim()}>
              <Save size={14} />
              {editingId ? "Update" : "Save Story"}
            </button>
            <button className="btn-ghost" onClick={resetForm}>
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {stories.length === 0 && !showForm ? (
        <div className="card mt-8 py-16 text-center">
          <p className="text-lg font-semibold text-gray-300">No stories yet</p>
          <p className="mt-2 text-sm text-gray-500">
            Add your first personal story to start adapting it to IELTS topics.
          </p>
          <button className="btn-neon mt-6" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Write Your First Story
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {stories.map((story) => {
            const adaptedCount = getAdaptedCountByStory(story.id);
            return (
              <div key={story.id} className="card-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={CATEGORY_COLORS[story.category]}>{CATEGORY_LABELS[story.category]}</span>
                      {adaptedCount > 0 && (
                        <span className="text-xs text-gray-500">{adaptedCount} adapted</span>
                      )}
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-gray-200">{story.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-400">{story.content}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => handleEdit(story)}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-dark-surface hover:text-gray-300"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
