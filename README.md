[![中文版本](https://img.shields.io/badge/🇨🇳_中文版本-点击查看-blue?style=for-the-badge)](#中文版本)

# IELTS Story Adapter

Write one personal story, and AI adapts it to fit any IELTS Speaking Part 2 topic.

**Live:** [ielts.openvibelab.com](https://ielts.openvibelab.com)

## Features

- **Story manager** — Create and organize personal stories by category (person, event, object, place)
- **Topic library** — 140+ real IELTS Part 2 cue cards (2026 Jan–Apr)
- **AI adaptation** — Pick a story + topic, AI rewrites it into a cue-card-ready answer
- **Batch generation** — Adapt one story to multiple topics at once, with pause/resume
- **Mind map** — Visualize story-topic coverage, spot gaps at a glance (React Flow)
- **History & corpus** — Browse all past adaptations, export as .txt/.json, print-friendly view
- **Text-to-speech** — Listen to adapted answers via Web Speech API
- **Bilingual UI** — Full English / 中文 toggle
- **Bring your own key** — When free quota runs out, use your own Gemini/DeepSeek/OpenAI key

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (warm study room theme — Literata serif, gold accents on warm dark background)
- **Visualization:** React Flow
- **AI:** Gemini `gemini-2.5-flash` (primary), DeepSeek / OpenAI (fallback)
- **Data:** 100% localStorage (no backend database)
- **Analytics:** Vercel Analytics

## Request Flow

```
Browser → /api/generate → Next.js API Route → Gemini / DeepSeek / OpenAI
                                                ↓
                                    { adapted_content, tips }
                                                ↓
                                          localStorage
```

- Server env keys are used by default
- Only when server quota is exhausted does the UI prompt for a user key
- User keys are stored in browser localStorage only
- All story/adaptation data lives entirely in the browser

## Getting Started

```bash
git clone https://github.com/openvibelab/100-day-002-ielts-story.git
cd 100-day-002-ielts-story
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example`. At minimum:

```env
GEMINI_API_KEY=
```

Optional:

```env
GEMINI_MODEL=gemini-2.5-flash
DEEPSEEK_API_KEY=
OPENAI_API_KEY=
```

## Deployment (Vercel)

Vercel auto-detects Next.js. Set env var `GEMINI_API_KEY`. Add `DEEPSEEK_API_KEY` or `OPENAI_API_KEY` for failover.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with feature overview and progress stats |
| `/stories` | Create, edit, delete personal stories |
| `/topics` | Browse and search 140+ IELTS Part 2 topics |
| `/adapt` | Single story + topic AI adaptation |
| `/batch` | Batch generation with pause/resume |
| `/corpus` | View all adaptations, export, print |
| `/history` | Timeline view of all adaptations |
| `/mind-map` | React Flow visualization of story-topic connections |
| `/export` | JSON backup and restore |

## License

MIT

---

<details id="中文版本" open>
<summary><h2>🇨🇳 中文版本</h2></summary>

# 雅思故事适配器

写一次个人故事，AI 帮你适配到任意雅思口语 Part 2 话题。

**在线地址:** [ielts.openvibelab.com](https://ielts.openvibelab.com)

## 主要功能

- **故事管理** — 输入真实个人故事（旅行、朋友、物品等）
- **话题库** — 140+ 雅思口语 Part 2 真题（2026 年 1-4 月题库）
- **AI 适配** — 选一个故事 + 话题，AI 改写成匹配 cue card 的回答
- **批量生成** — 一个故事适配多个话题，支持暂停/继续
- **思维导图** — 可视化故事与话题的覆盖关系，一眼发现空白
- **历史记录** — 查看所有生成过的适配结果，导出 .txt/.json
- **语音朗读** — Web Speech API 朗读适配结果
- **双语界面** — 中英文一键切换
- **浏览器 Key** — 免费额度不够时，可临时切到用户自己的 API Key

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址: http://localhost:3000

## 环境变量

至少需要 `GEMINI_API_KEY`。参考 `.env.example`。

## 常见问题

1. **页面提示"免费额度用完了"** — 服务端 AI Key 被限流。稍后再试，或在页面里填自己的 Key。
2. **生成结果为空或格式异常** — 检查 `/api/generate` 日志和模型名。

## 许可

MIT

</details>
