export type Locale = "en" | "zh";

const LOCALE_KEY = "isa_locale";

export function getLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem(LOCALE_KEY) as Locale) || "en";
}

export function setLocale(locale: Locale): void {
  localStorage.setItem(LOCALE_KEY, locale);
}

// All translations
const translations = {
  // Common
  cancel: { en: "Cancel", zh: "取消" },
  save: { en: "Save", zh: "保存" },
  delete: { en: "Delete", zh: "删除" },
  copy: { en: "Copy", zh: "复制" },
  copied: { en: "Copied", zh: "已复制" },
  confirm: { en: "Confirm", zh: "确认" },
  loading: { en: "Loading...", zh: "加载中..." },
  listen: { en: "Listen", zh: "听一听" },
  stop: { en: "Stop", zh: "停止" },
  edit: { en: "Edit", zh: "编辑" },
  words: { en: "words", zh: "词" },

  // Nav
  navStories: { en: "Stories", zh: "我的故事" },
  navTopics: { en: "Topics", zh: "题库" },
  navAdapt: { en: "Adapt", zh: "改编" },
  navBatch: { en: "Batch", zh: "批量" },
  navMindMap: { en: "Mind Map", zh: "导图" },
  navCorpus: { en: "Corpus", zh: "素材库" },

  // Homepage
  homeTitle1: { en: "One story.", zh: "一个故事，" },
  homeTitle2: { en: "Every topic.", zh: "百变回答。" },
  homeDesc: {
    en: "Write a few personal core stories, then let AI adapt them to fit any IELTS Speaking Part 2 topic. Practice smarter, not harder.",
    zh: "准备几个核心故事，让 AI 帮你改编成任意雅思口语 Part 2 话题的回答。高效备考，事半功倍。",
  },
  homeGetStarted: { en: "Get Started", zh: "开始使用" },
  homeBrowseTopics: { en: "Browse Topics", zh: "看看题库" },
  homeWriteStories: { en: "Write Stories", zh: "写故事" },
  homeWriteStoriesDesc: {
    en: "Input 6-10 detailed personal stories — a trip, a friend, a meaningful object.",
    zh: "准备 6-10 个你的真实经历——一次旅行、一个朋友、一件有意义的东西。",
  },
  home140Topics: { en: "140+ Topics", zh: "140+ 真题" },
  home140TopicsDesc: {
    en: "Browse the full IELTS Part 2 topic bank (2026 Jan-Apr), organized by category.",
    zh: "完整收录雅思口语 Part 2 题库（2026 年 1-4 月季），按类别分好了。",
  },
  homeAIAdapt: { en: "AI Adapt", zh: "AI 改编" },
  homeAIAdaptDesc: {
    en: "Pick a story + topic. AI rewrites your story to answer that cue card.",
    zh: "选一个故事 + 一道题，AI 把你的故事改编成对应的口语回答。",
  },
  homeBatchAdapt: { en: "Batch Adapt", zh: "一键批量" },
  homeBatchAdaptDesc: {
    en: "Select a story, check multiple topics, one-click batch generate your entire corpus.",
    zh: "选一个故事，勾几道题，一键批量生成整套口语素材。",
  },
  homeMindMap: { en: "Mind Map", zh: "思维导图" },
  homeMindMapDesc: {
    en: "Visualize which stories cover which topics. Find gaps at a glance.",
    zh: "一张图看清哪些故事覆盖了哪些题，哪里还有空白。",
  },
  homeCorpus: { en: "Corpus", zh: "素材库" },
  homeCorpusDesc: {
    en: "Review all adaptations, export as text, backup as JSON, or print for offline practice.",
    zh: "查看全部改编结果，可以导出文本、备份数据，或者打印出来练。",
  },

  // Progress
  progressStories: { en: "Stories", zh: "个故事" },
  progressAdaptations: { en: "Adaptations", zh: "篇回答" },
  progressTopics: { en: "topics", zh: "道题" },
  progressCovered: { en: "covered", zh: "已搞定" },
  progressRemaining: { en: "topics remaining", zh: "道题还没搞" },

  // Stories page
  storiesTitle: { en: "My Core Stories", zh: "我的核心故事" },
  storiesDesc: {
    en: "Write 6-10 detailed personal stories. The more specific, the better AI can adapt them.",
    zh: "写 6-10 个真实的个人经历，写得越详细，AI 改编效果越好。",
  },
  storiesAdd: { en: "Add Story", zh: "写新故事" },
  storiesNoStories: { en: "No stories yet", zh: "还没有故事" },
  storiesNoStoriesDesc: {
    en: "Add your first personal story to start adapting it to IELTS topics.",
    zh: "写下你的第一个故事，开始生成雅思口语回答吧。",
  },
  storiesWriteFirst: { en: "Write Your First Story", zh: "写第一个故事" },
  storiesNewStory: { en: "New Core Story", zh: "新故事" },
  storiesEditStory: { en: "Edit Story", zh: "编辑故事" },
  storiesTitleLabel: { en: "Title", zh: "标题" },
  storiesTitlePlaceholder: { en: "e.g. 'Trip to Beijing'", zh: "比如「北京之旅」" },
  storiesCategory: { en: "Category", zh: "分类" },
  storiesYourStory: { en: "Your Story", zh: "故事内容" },
  storiesHint: {
    en: "Include: who was involved, what happened, how you felt, and why it matters. Aim for 150-400 words.",
    zh: "写清楚：和谁有关、发生了什么、你什么感受、为什么印象深刻。建议 150-400 词。",
  },
  storiesPlaceholder: { en: "Write your story in detail...", zh: "把你的故事写详细一点..." },
  storiesTooShort: {
    en: (n: number) => `Story seems short (${n} words). Try adding more detail for better AI adaptations.`,
    zh: (n: number) => `有点短（${n} 词），多写点细节，AI 改编出来会更好。`,
  },
  storiesUpdate: { en: "Update", zh: "更新" },
  storiesSaveStory: { en: "Save Story", zh: "保存" },
  storiesAdapted: { en: "adapted", zh: "篇改编" },
  storiesDeleteTitle: { en: "Delete Story", zh: "删除故事" },
  storiesDeleteMsg: {
    en: (title: string, count: number) =>
      count > 0
        ? `Delete "${title}" and its ${count} adapted responses? This cannot be undone.`
        : `Delete "${title}"? This cannot be undone.`,
    zh: (title: string, count: number) =>
      count > 0
        ? `确定删除「${title}」吗？它的 ${count} 篇改编回答也会一起删掉，无法恢复。`
        : `确定删除「${title}」吗？删了就没了。`,
  },

  // Category labels
  catPerson: { en: "Person", zh: "人物" },
  catEvent: { en: "Event", zh: "事件" },
  catObject: { en: "Object", zh: "物品" },
  catPlace: { en: "Place", zh: "地点" },
  catAll: { en: "All", zh: "全部" },

  // Topics page
  topicsTitle: { en: "IELTS Speaking Topics", zh: "雅思口语题库" },
  topicsCovered: { en: "covered", zh: "已搞定" },
  topicsQuickAdapt: { en: "Quick adapt with:", zh: "用这个故事改编：" },
  topicsAddStoryFirst: { en: "Add a story first", zh: "先去写个故事" },

  // Adapt page
  adaptTitle: { en: "Adapt Story to Topic", zh: "改编故事" },
  adaptDesc: {
    en: "Pick one of your stories and a topic. AI will rewrite your story to fit the cue card.",
    zh: "选一个故事和一道题，AI 会把你的故事改写成口语回答。",
  },
  adaptStep1: { en: "1. Choose a story", zh: "1. 选个故事" },
  adaptStep2: { en: "2. Choose a topic", zh: "2. 选道题" },
  adaptNoStories: { en: "No stories yet.", zh: "还没有故事" },
  adaptAddFirst: { en: "Add a story first", zh: "先去写个故事" },
  adaptCueCard: { en: "Cue Card", zh: "题目卡片" },
  adaptAlreadyAdapted: { en: "Already adapted", zh: "已经改编过" },
  adaptGenerate: { en: "Adapt Story", zh: "开始改编" },
  adaptRegenerate: { en: "Regenerate", zh: "重新生成" },
  adaptGenerating: { en: "Generating...", zh: "生成中..." },
  adaptResult: { en: "Adapted Response", zh: "改编后的回答" },
  adaptTips: { en: "Speaking Tips", zh: "口语小贴士" },
  adaptSelectHint: { en: "Select a story and topic to continue", zh: "请先选故事和话题" },
  adaptRegenTitle: { en: "Regenerate Adaptation", zh: "重新生成" },
  adaptRegenMsg: {
    en: "This will replace the existing adapted response. The current version will be lost.",
    zh: "会覆盖掉现在的版本，当前内容将丢失。",
  },
  adaptApiKey: { en: "API Key", zh: "API 密钥" },
  adaptQuotaError: {
    en: "API quota exceeded. Configure your own API key below to continue.",
    zh: "免费额度用完了，在下方填入你自己的 API 密钥就能继续用。",
  },
  adaptInvalidKey: {
    en: "Invalid API key. Please check your key and try again.",
    zh: "密钥不对，检查一下再试试。",
  },

  // Batch page
  batchTitle: { en: "Batch Adapt", zh: "批量改编" },
  batchDesc: {
    en: "Select a story and multiple topics. AI will adapt your story to each topic one by one.",
    zh: "选一个故事和多道题，AI 会逐个帮你生成口语回答。",
  },
  batchStep1: { en: "1. Choose a story", zh: "1. 选个故事" },
  batchStep2Selected: { en: (n: number) => `2. Choose topics (${n} selected)`, zh: (n: number) => `2. 选话题（已选 ${n} 个）` },
  batchSelectAll: { en: "Select All", zh: "全选" },
  batchClear: { en: "Clear", zh: "清空" },
  batchUntouched: { en: "Untouched Only", zh: "只选没做过的" },
  batchSkipExisting: { en: "Skip already adapted", zh: "跳过已有的" },
  batchDelay: { en: "Delay:", zh: "间隔：" },
  batchStart: { en: (n: number) => `Start Batch (${n} topics)`, zh: (n: number) => `开始生成（${n} 道题）` },
  batchPause: { en: "Pause", zh: "暂停" },
  batchResume: { en: "Resume", zh: "继续" },
  batchRemaining: { en: "remaining", zh: "剩余" },
  batchComplete: { en: "Batch Complete!", zh: "全部搞定！" },
  batchGenerated: { en: "generated", zh: "已生成" },
  batchSkipped: { en: "skipped", zh: "跳过" },
  batchFailed: { en: "failed", zh: "失败" },
  batchDone: { en: "done", zh: "完成" },
  batchAlreadyAdapted: { en: "Already adapted", zh: "之前做过了" },
  batchViewCorpus: { en: "View Corpus", zh: "去看素材库" },
  batchSeeMindMap: { en: "See Mind Map", zh: "看看导图" },
  batchUnfinished: {
    en: (title: string, n: number) => `Unfinished batch: "${title}" — ${n} topics remaining`,
    zh: (title: string, n: number) => `上次没做完：「${title}」还剩 ${n} 道题`,
  },
  batchDismiss: { en: "Dismiss", zh: "算了" },

  // Corpus page
  corpusTitle: { en: "My Corpus", zh: "我的素材库" },
  corpusStories: { en: "stories", zh: "个故事" },
  corpusAdaptations: { en: "adaptations", zh: "篇回答" },
  corpusBackup: { en: "Backup .json", zh: "备份数据" },
  corpusImport: { en: "Import", zh: "导入" },
  corpusDownload: { en: "Download .txt", zh: "下载文本" },
  corpusPrint: { en: "Print", zh: "打印" },
  corpusNoAdaptations: { en: "No adaptations yet", zh: "还没有生成过回答" },
  corpusNoAdaptationsDesc: {
    en: "Use Adapt or Batch Adapt to generate your first adaptation.",
    zh: "去「改编」或「批量」页面生成你的第一篇口语回答吧。",
  },
  corpusSingleAdapt: { en: "Single Adapt", zh: "去改编" },
  corpusBatchAdapt: { en: "Batch Adapt", zh: "批量生成" },
  corpusByStory: { en: "By Story", zh: "按故事看" },
  corpusTimeline: { en: "Timeline", zh: "按时间" },
  corpusOriginalStory: { en: "Original Story", zh: "原始故事" },
  corpusCueCard: { en: "Cue Card", zh: "题目卡片" },
  corpusSpeakingTips: { en: "Speaking Tips", zh: "口语小贴士" },
  corpusDeleteTitle: { en: "Delete Adaptation", zh: "删除这篇回答" },
  corpusDeleteMsg: {
    en: (title: string) => `Delete the adaptation for "${title}"?`,
    zh: (title: string) => `确定删除「${title}」的改编回答吗？`,
  },

  // Mind Map
  mindMapTitle: { en: "Mind Map", zh: "思维导图" },
  mindMapDesc: {
    en: "Visualize how your stories connect to IELTS topics.",
    zh: "一张图看清你的故事和话题之间的关系。",
  },
  mindMapEmpty: { en: "Nothing to show yet", zh: "还没有内容" },
  mindMapEmptyDesc: {
    en: "Add stories and adapt them to see how your corpus grows.",
    zh: "先写故事、做改编，这里会展示你的素材覆盖情况。",
  },
  mindMapAddStories: { en: "Add Stories", zh: "去写故事" },
  mindMapClickToView: { en: "Click a topic to view", zh: "点击话题可查看" },
  mindMapMyStories: { en: "My Stories", zh: "我的故事" },

  // API Key setup
  apiKeyTitle: { en: "API Key Configuration", zh: "设置 API 密钥" },
  apiKeyDesc: {
    en: "Use your own API key when the free quota is exhausted. Your key is stored locally in your browser.",
    zh: "免费额度用完了可以填自己的密钥。放心，密钥只存在你的浏览器里。",
  },
  apiKeyProvider: { en: "Provider", zh: "服务商" },
  apiKeyLabel: { en: "API Key", zh: "密钥" },
  apiKeySave: { en: "Save Key", zh: "保存" },
  apiKeyClear: { en: "Clear Key", zh: "清除" },
  apiKeySaved: { en: "Saved", zh: "已保存" },

  // Data safety banner
  dataBanner: {
    en: "All data is stored locally in your browser. Clearing browser data will permanently delete your stories and adaptations.",
    zh: "所有数据都存在浏览器本地，清除浏览器数据会导致内容丢失。",
  },
  dataBannerExport: { en: "Export a backup", zh: "去备份一下" },

  // Topic combobox
  topicSelect: { en: "Select a topic...", zh: "选一道题..." },
  topicSearch: { en: "Search topics...", zh: "搜索话题..." },
  topicNoResults: { en: "No topics found", zh: "没找到相关话题" },

  // Speak button
  speakListen: { en: "Listen", zh: "听一听" },
  speakStop: { en: "Stop", zh: "停止" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string | ((...args: never[]) => string) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[locale] as string | ((...args: never[]) => string);
}

// Simple string getter
export function ts(key: TranslationKey, locale: Locale): string {
  const val = translations[key]?.[locale];
  return typeof val === "string" ? val : key;
}

// Locale-aware category labels
import type { StoryCategory } from "./types";

const CAT_LABEL_MAP: Record<StoryCategory, TranslationKey> = {
  person: "catPerson",
  event: "catEvent",
  object: "catObject",
  place: "catPlace",
};

export function catLabel(cat: StoryCategory, locale: Locale): string {
  return ts(CAT_LABEL_MAP[cat], locale);
}
