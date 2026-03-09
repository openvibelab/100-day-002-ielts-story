# IELTS Story Adapter

Write personal stories once, AI adapts them to any IELTS Speaking Part 2 topic.

Part of the [OpenVibeLab](https://openvibelab.com) 100-day vibe coding challenge -- Day 002.

## Tech Stack

- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: React Flow (mind map)
- **AI**: Gemini 2.5 Flash (primary)

## Features

- Core story management -- write once, reuse everywhere
- 140+ IELTS Speaking Part 2 topics database
- AI-powered story adaptation to match any topic
- Mind map visualization of story-topic connections
- Multi-provider support (Gemini / DeepSeek / OpenAI)
- User custom API key support (stored in localStorage)

## Quick Start

```bash
git clone https://github.com/openvibelab/100-day-002-ielts-story.git
cd 100-day-002-ielts-story
npm install
cp .env.example .env.local
# Add your API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | -- | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Model to use |

## Deploy

**Vercel (recommended):**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/openvibelab/100-day-002-ielts-story)

Or manually: connect your GitHub repo in the Vercel dashboard, set environment variables, and deploy.

## Links

- [OpenVibeLab](https://openvibelab.com) -- main site
- [Day 001: AI Judge](https://github.com/openvibelab/100-day-001-ai-judge)
- [GitHub Org](https://github.com/openvibelab)

## License

MIT
