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
  listen: { en: "Listen", zh: "朗读" },
  stop: { en: "Stop", zh: "停止" },
  edit: { en: "Edit", zh: "编辑" },
  words: { en: "words", zh: "词" },

  // Nav
  navStories: { en: "Stories", zh: "故事" },
  navTopics: { en: "Topics", zh: "话题" },
  navAdapt: { en: "Adapt", zh: "适配" },
  navBatch: { en: "Batch", zh: "批量" },
  navMindMap: { en: "Mind Map", zh: "导图" },
  navCorpus: { en: "Corpus", zh: "语料库" },

  // Homepage
  homeTitle1: { en: "One story.", zh: "一个故事。" },
  homeTitle2: { en: "Every topic.", zh: "百变话题。" },
  homeDesc: {
    en: "Write a few personal core stories, then let AI adapt them to fit any IELTS Speaking Part 2 topic. Practice smarter, not harder.",
    zh: "写几个核心个人故事，AI 帮你适配任意雅思口语 Part 2 话题。聪明备考，事半功倍。",
  },
  homeGetStarted: { en: "Get Started", zh: "开始使用" },
  homeBrowseTopics: { en: "Browse Topics", zh: "浏览话题" },
  homeWriteStories: { en: "Write Stories", zh: "写故事" },
  homeWriteStoriesDesc: {
    en: "Input 6-10 detailed personal stories — a trip, a friend, a meaningful object.",
    zh: "写 6-10 个详细的个人故事 —— 一次旅行、一个朋友、一件有意义的物品。",
  },
  home140Topics: { en: "140+ Topics", zh: "140+ 话题" },
  home140TopicsDesc: {
    en: "Browse the full IELTS Part 2 topic bank (2026 Jan-Apr), organized by category.",
    zh: "浏览完整雅思口语 Part 2 题库（2026年1-4月），按分类整理。",
  },
  homeAIAdapt: { en: "AI Adapt", zh: "AI 适配" },
  homeAIAdaptDesc: {
    en: "Pick a story + topic. AI rewrites your story to answer that cue card.",
    zh: "选一个故事 + 话题，AI 改写你的故事来回答该 cue card。",
  },
  homeBatchAdapt: { en: "Batch Adapt", zh: "批量适配" },
  homeBatchAdaptDesc: {
    en: "Select a story, check multiple topics, one-click batch generate your entire corpus.",
    zh: "选一个故事，勾选多个话题，一键批量生成整套语料。",
  },
  homeMindMap: { en: "Mind Map", zh: "思维导图" },
  homeMindMapDesc: {
    en: "Visualize which stories cover which topics. Find gaps at a glance.",
    zh: "可视化故事与话题的覆盖关系，一眼发现空白。",
  },
  homeCorpus: { en: "Corpus", zh: "语料库" },
  homeCorpusDesc: {
    en: "Review all adaptations, export as text, backup as JSON, or print for offline practice.",
    zh: "查看所有适配结果，导出文本、JSON 备份、打印离线练习。",
  },

  // Progress
  progressStories: { en: "Stories", zh: "故事" },
  progressAdaptations: { en: "Adaptations", zh: "适配" },
  progressTopics: { en: "topics", zh: "个话题" },
  progressCovered: { en: "covered", zh: "已覆盖" },
  progressRemaining: { en: "topics remaining", zh: "个话题待覆盖" },

  // Stories page
  storiesTitle: { en: "My Core Stories", zh: "我的核心故事" },
  storiesDesc: {
    en: "Write 6-10 detailed personal stories. The more specific, the better AI can adapt them.",
    zh: "写 6-10 个详细的个人故事。越具体，AI 适配效果越好。",
  },
  storiesAdd: { en: "Add Story", zh: "添加故事" },
  storiesNoStories: { en: "No stories yet", zh: "还没有故事" },
  storiesNoStoriesDesc: {
    en: "Add your first personal story to start adapting it to IELTS topics.",
    zh: "添加你的第一个个人故事，开始适配雅思话题。",
  },
  storiesWriteFirst: { en: "Write Your First Story", zh: "写第一个故事" },
  storiesNewStory: { en: "New Core Story", zh: "新建核心故事" },
  storiesEditStory: { en: "Edit Story", zh: "编辑故事" },
  storiesTitleLabel: { en: "Title", zh: "标题" },
  storiesTitlePlaceholder: { en: "e.g. 'Trip to Beijing'", zh: "例如「北京之旅」" },
  storiesCategory: { en: "Category", zh: "分类" },
  storiesYourStory: { en: "Your Story", zh: "你的故事" },
  storiesHint: {
    en: "Include: who was involved, what happened, how you felt, and why it matters. Aim for 150-400 words.",
    zh: "包含：涉及谁、发生了什么、你的感受、为什么重要。建议 150-400 词。",
  },
  storiesPlaceholder: { en: "Write your story in detail...", zh: "详细写你的故事..." },
  storiesTooShort: {
    en: (n: number) => `Story seems short (${n} words). Try adding more detail for better AI adaptations.`,
    zh: (n: number) => `故事偏短（${n} 词），建议补充更多细节以获得更好的 AI 适配效果。`,
  },
  storiesUpdate: { en: "Update", zh: "更新" },
  storiesSaveStory: { en: "Save Story", zh: "保存故事" },
  storiesAdapted: { en: "adapted", zh: "已适配" },
  storiesDeleteTitle: { en: "Delete Story", zh: "删除故事" },
  storiesDeleteMsg: {
    en: (title: string, count: number) =>
      count > 0
        ? `Delete "${title}" and its ${count} adapted responses? This cannot be undone.`
        : `Delete "${title}"? This cannot be undone.`,
    zh: (title: string, count: number) =>
      count > 0
        ? `删除「${title}」及其 ${count} 条适配结果？此操作不可撤销。`
        : `删除「${title}」？此操作不可撤销。`,
  },

  // Category labels
  catPerson: { en: "Person", zh: "人物" },
  catEvent: { en: "Event", zh: "事件" },
  catObject: { en: "Object", zh: "物品" },
  catPlace: { en: "Place", zh: "地点" },
  catAll: { en: "All", zh: "全部" },

  // Topics page
  topicsTitle: { en: "IELTS Speaking Topics", zh: "雅思口语话题" },
  topicsCovered: { en: "covered", zh: "已覆盖" },
  topicsQuickAdapt: { en: "Quick adapt with:", zh: "快速适配：" },
  topicsAddStoryFirst: { en: "Add a story first", zh: "先添加一个故事" },

  // Adapt page
  adaptTitle: { en: "Adapt Story to Topic", zh: "适配故事到话题" },
  adaptDesc: {
    en: "Pick one of your stories and a topic. AI will rewrite your story to fit the cue card.",
    zh: "选一个故事和一个话题，AI 会改写你的故事来回答 cue card。",
  },
  adaptStep1: { en: "1. Choose a story", zh: "1. 选择故事" },
  adaptStep2: { en: "2. Choose a topic", zh: "2. 选择话题" },
  adaptNoStories: { en: "No stories yet.", zh: "还没有故事。" },
  adaptAddFirst: { en: "Add a story first", zh: "先添加一个故事" },
  adaptCueCard: { en: "Cue Card", zh: "题卡" },
  adaptAlreadyAdapted: { en: "Already adapted", zh: "已有适配" },
  adaptGenerate: { en: "Adapt Story", zh: "开始适配" },
  adaptRegenerate: { en: "Regenerate", zh: "重新生成" },
  adaptGenerating: { en: "Generating...", zh: "生成中..." },
  adaptResult: { en: "Adapted Response", zh: "适配结果" },
  adaptTips: { en: "Speaking Tips", zh: "口语技巧" },
  adaptSelectHint: { en: "Select a story and topic to continue", zh: "请选择故事和话题" },
  adaptRegenTitle: { en: "Regenerate Adaptation", zh: "重新生成适配" },
  adaptRegenMsg: {
    en: "This will replace the existing adapted response. The current version will be lost.",
    zh: "将替换现有的适配结果，当前版本会丢失。",
  },
  adaptApiKey: { en: "API Key", zh: "API 密钥" },
  adaptQuotaError: {
    en: "API quota exceeded. Configure your own API key below to continue.",
    zh: "API 额度已用完，请在下方配置自己的 API 密钥继续使用。",
  },
  adaptInvalidKey: {
    en: "Invalid API key. Please check your key and try again.",
    zh: "API 密钥无效，请检查后重试。",
  },

  // Batch page
  batchTitle: { en: "Batch Adapt", zh: "批量适配" },
  batchDesc: {
    en: "Select a story and multiple topics. AI will adapt your story to each topic one by one.",
    zh: "选一个故事和多个话题，AI 会逐一将你的故事适配到每个话题。",
  },
  batchStep1: { en: "1. Choose a story", zh: "1. 选择故事" },
  batchStep2Selected: { en: (n: number) => `2. Choose topics (${n} selected)`, zh: (n: number) => `2. 选择话题（已选 ${n} 个）` },
  batchSelectAll: { en: "Select All", zh: "全选" },
  batchClear: { en: "Clear", zh: "清空" },
  batchUntouched: { en: "Untouched Only", zh: "仅未适配" },
  batchSkipExisting: { en: "Skip already adapted", zh: "跳过已适配" },
  batchDelay: { en: "Delay:", zh: "间隔：" },
  batchStart: { en: (n: number) => `Start Batch (${n} topics)`, zh: (n: number) => `开始批量（${n} 个话题）` },
  batchPause: { en: "Pause", zh: "暂停" },
  batchResume: { en: "Resume", zh: "继续" },
  batchRemaining: { en: "remaining", zh: "剩余" },
  batchComplete: { en: "Batch Complete!", zh: "批量完成！" },
  batchGenerated: { en: "generated", zh: "已生成" },
  batchSkipped: { en: "skipped", zh: "已跳过" },
  batchFailed: { en: "failed", zh: "失败" },
  batchDone: { en: "done", zh: "完成" },
  batchAlreadyAdapted: { en: "Already adapted", zh: "已适配" },
  batchViewCorpus: { en: "View Corpus", zh: "查看语料库" },
  batchSeeMindMap: { en: "See Mind Map", zh: "查看导图" },
  batchUnfinished: {
    en: (title: string, n: number) => `Unfinished batch: "${title}" — ${n} topics remaining`,
    zh: (title: string, n: number) => `未完成的批量任务：「${title}」— 剩余 ${n} 个话题`,
  },
  batchDismiss: { en: "Dismiss", zh: "忽略" },

  // Corpus page
  corpusTitle: { en: "My Corpus", zh: "我的语料库" },
  corpusStories: { en: "stories", zh: "个故事" },
  corpusAdaptations: { en: "adaptations", zh: "条适配" },
  corpusBackup: { en: "Backup .json", zh: "备份 .json" },
  corpusImport: { en: "Import", zh: "导入" },
  corpusDownload: { en: "Download .txt", zh: "下载 .txt" },
  corpusPrint: { en: "Print", zh: "打印" },
  corpusNoAdaptations: { en: "No adaptations yet", zh: "还没有适配结果" },
  corpusNoAdaptationsDesc: {
    en: "Use Adapt or Batch Adapt to generate your first adaptation.",
    zh: "使用适配或批量适配来生成你的第一条适配结果。",
  },
  corpusSingleAdapt: { en: "Single Adapt", zh: "单个适配" },
  corpusBatchAdapt: { en: "Batch Adapt", zh: "批量适配" },
  corpusByStory: { en: "By Story", zh: "按故事" },
  corpusTimeline: { en: "Timeline", zh: "时间线" },
  corpusOriginalStory: { en: "Original Story", zh: "原始故事" },
  corpusCueCard: { en: "Cue Card", zh: "题卡" },
  corpusSpeakingTips: { en: "Speaking Tips", zh: "口语技巧" },
  corpusDeleteTitle: { en: "Delete Adaptation", zh: "删除适配" },
  corpusDeleteMsg: {
    en: (title: string) => `Delete the adaptation for "${title}"?`,
    zh: (title: string) => `删除「${title}」的适配结果？`,
  },

  // Mind Map
  mindMapTitle: { en: "Mind Map", zh: "思维导图" },
  mindMapDesc: {
    en: "Visualize how your stories connect to IELTS topics.",
    zh: "可视化你的故事与雅思话题的关联关系。",
  },
  mindMapEmpty: { en: "Nothing to show yet", zh: "暂无内容" },
  mindMapEmptyDesc: {
    en: "Add stories and adapt them to see how your corpus grows.",
    zh: "添加故事并进行适配，看你的语料库如何增长。",
  },
  mindMapAddStories: { en: "Add Stories", zh: "添加故事" },
  mindMapClickToView: { en: "Click a topic to view", zh: "点击话题查看详情" },
  mindMapMyStories: { en: "My Stories", zh: "我的故事" },

  // API Key setup
  apiKeyTitle: { en: "API Key Configuration", zh: "API 密钥配置" },
  apiKeyDesc: {
    en: "Use your own API key when the free quota is exhausted. Your key is stored locally in your browser.",
    zh: "免费额度用完时可使用自己的 API 密钥。密钥仅保存在浏览器本地。",
  },
  apiKeyProvider: { en: "Provider", zh: "服务商" },
  apiKeyLabel: { en: "API Key", zh: "API 密钥" },
  apiKeySave: { en: "Save Key", zh: "保存密钥" },
  apiKeyClear: { en: "Clear Key", zh: "清除密钥" },
  apiKeySaved: { en: "Saved", zh: "已保存" },

  // Data safety banner
  dataBanner: {
    en: "All data is stored locally in your browser. Clearing browser data will permanently delete your stories and adaptations.",
    zh: "所有数据仅保存在浏览器本地。清除浏览器数据将永久删除你的故事和适配结果。",
  },
  dataBannerExport: { en: "Export a backup", zh: "导出备份" },

  // Topic combobox
  topicSelect: { en: "Select a topic...", zh: "选择话题..." },
  topicSearch: { en: "Search topics...", zh: "搜索话题..." },
  topicNoResults: { en: "No topics found", zh: "未找到话题" },

  // Speak button
  speakListen: { en: "Listen", zh: "朗读" },
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
