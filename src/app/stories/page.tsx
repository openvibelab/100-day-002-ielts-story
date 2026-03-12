"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { CoreStory, StoryCategory, CATEGORY_COLORS } from "@/lib/types";
import { getStories, saveStory, updateStory, deleteStory, getAdaptedCountByStory } from "@/lib/store";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useLang } from "@/lib/LangContext";
import { ts, t, catLabel } from "@/lib/i18n";

const CATEGORIES: StoryCategory[] = ["person", "event", "object", "place"];

export default function StoriesPage() {
  const [stories, setStories] = useState<CoreStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<StoryCategory>("event");
  const [content, setContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; adaptedCount: number } | null>(null);
  const { locale } = useLang();

  useEffect(() => {
    setStories(getStories());
    setLoading(false);
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

  function handleDeleteClick(story: CoreStory) {
    const adaptedCount = getAdaptedCountByStory(story.id);
    setDeleteTarget({ id: story.id, title: story.title, adaptedCount });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteStory(deleteTarget.id);
    setStories(getStories());
    setDeleteTarget(null);
  }

  function resetForm() {
    setTitle("");
    setCategory("event");
    setContent("");
    setShowForm(false);
    setEditingId(null);
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const isShort = content.trim().length > 0 && wordCount < 80;

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-48" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const deleteMsg = deleteTarget
    ? (t("storiesDeleteMsg", locale) as (title: string, count: number) => string)(deleteTarget.title, deleteTarget.adaptedCount)
    : "";

  return (
    <div className="page-container">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{ts("storiesTitle", locale)}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {ts("storiesDesc", locale)}
          </p>
        </div>
        <button className="btn-accent" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} />
          {ts("storiesAdd", locale)}
        </button>
      </div>

      {showForm && (
        <div className="card mt-6">
          <h3 className="text-sm font-semibold text-warm-text">
            {editingId ? ts("storiesEditStory", locale) : ts("storiesNewStory", locale)}
          </h3>

          <div className="mt-4">
            <label htmlFor="story-title" className="mb-1.5 block text-xs font-medium text-warm-secondary">
              {ts("storiesTitleLabel", locale)}
            </label>
            <input
              id="story-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={ts("storiesTitlePlaceholder", locale)}
              className="input-dark"
              maxLength={100}
            />
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-warm-secondary">{ts("storiesCategory", locale)}</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === cat
                      ? "border-amber-400 bg-amber-500/10 text-amber-400"
                      : "border-dark-border text-gray-500 hover:border-gray-500 hover:text-gray-300"
                  }`}
                >
                  {catLabel(cat, locale)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="story-content" className="mb-1.5 block text-xs font-medium text-warm-secondary">
              {ts("storiesYourStory", locale)}
            </label>
            <p className="mb-2 text-xs text-warm-muted">
              {ts("storiesHint", locale)}
            </p>
            <textarea
              id="story-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={ts("storiesPlaceholder", locale)}
              className="textarea-dark mt-1 min-h-[200px]"
              maxLength={3000}
            />
            <div className="mt-1 flex justify-between text-xs">
              {isShort ? (
                <span className="text-amber-400">{(t("storiesTooShort", locale) as (n: number) => string)(wordCount)}</span>
              ) : (
                <span className="text-warm-muted">{wordCount} {ts("words", locale)}</span>
              )}
              <span className="text-warm-muted">{content.length}/3000</span>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button className="btn-accent-solid" onClick={handleSave} disabled={!title.trim() || !content.trim()}>
              <Save size={14} />
              {editingId ? ts("storiesUpdate", locale) : ts("storiesSaveStory", locale)}
            </button>
            <button className="btn-ghost" onClick={resetForm}>
              <X size={14} />
              {ts("cancel", locale)}
            </button>
          </div>
        </div>
      )}

      {stories.length === 0 && !showForm ? (
        <div className="card mt-8 py-16 text-center">
          <p className="text-lg font-semibold text-gray-300">{ts("storiesNoStories", locale)}</p>
          <p className="mt-2 text-sm text-gray-500">
            {ts("storiesNoStoriesDesc", locale)}
          </p>
          <button className="btn-accent mt-6" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            {ts("storiesWriteFirst", locale)}
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
                      <span className={CATEGORY_COLORS[story.category]}>{catLabel(story.category, locale)}</span>
                      {adaptedCount > 0 && (
                        <span className="text-xs text-gray-500">{adaptedCount} {ts("storiesAdapted", locale)}</span>
                      )}
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-warm-text">{story.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-warm-secondary">{story.content}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => handleEdit(story)}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-dark-surface hover:text-gray-300"
                      aria-label={`Edit: ${story.title}`}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(story)}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label={`Delete: ${story.title}`}
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

      <ConfirmDialog
        open={!!deleteTarget}
        title={ts("storiesDeleteTitle", locale)}
        message={deleteMsg}
        confirmLabel={ts("delete", locale)}
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
