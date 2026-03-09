# IELTS Story Adapter

写一次个人故事，AI 帮你适配到任意雅思口语 Part 2 话题。

在线地址: `https://ielts.openvibelab.com`

## 当前状态

- 前端: Next.js 14 + TypeScript + Tailwind CSS
- AI 接入: Next.js API Route
- 默认模型: Gemini `gemini-2.5-flash`
- 备用模型: DeepSeek / OpenAI
- 可视化: React Flow (思维导图)
- 数据存储: localStorage

## 主要功能

- 故事管理: 输入真实个人故事 (旅行、朋友、物品等)
- 话题库: 140+ 雅思口语 Part 2 真题 (2026 年 1-4 月题库)
- AI 适配: 选一个故事 + 话题，AI 改写成匹配 cue card 的回答
- 思维导图: 可视化故事与话题的覆盖关系，一眼发现空白
- 历史记录: 查看所有生成过的适配结果
- 浏览器 Key: 免费额度不够时，可临时切到用户自己的 API Key

## 请求链路

```text
Browser
  -> /api/generate
  -> Next.js API Route
  -> Gemini / DeepSeek / OpenAI
  -> 返回 { adapted_content, tips }
  -> localStorage
```

说明:

- 默认优先使用服务端环境变量里的模型 Key
- 只有服务端额度受限时，才会提示用户填自己的 Key
- 用户自己的 Key 只保存在浏览器 localStorage，不写入服务端
- 但真正调用时，这把 Key 会随本次请求发到本站后端，再由后端转发给模型服务

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址:

```text
http://localhost:3000
```

## 环境变量

至少需要一组 AI Key 才能生成结果。

```env
GEMINI_API_KEY=
```

可选变量:

```env
GEMINI_MODEL=gemini-2.5-flash
```

如果你希望服务端在 Gemini 失败时自动切换，额外再配一组:

```env
DEEPSEEK_API_KEY=
```

或:

```env
OPENAI_API_KEY=
```

## Vercel 部署

推荐最少环境变量:

```env
GEMINI_API_KEY=...
```

如果你希望服务端在 Gemini 失败时自动切换，额外再配一组:

```env
DEEPSEEK_API_KEY=...
```

或:

```env
OPENAI_API_KEY=...
```

## 常见问题

### 1. 页面提示"免费额度用完了"

表示服务端默认 AI Key 当前被限流或额度受限。

处理方式:

1. 稍后再试
2. 配置备用服务端 Key
3. 在页面里填自己的 API Key 继续

### 2. 生成结果为空或格式异常

通常需要检查:

- `/api/generate` 日志
- 当前 Gemini 模型名是否可用
- 上游返回是否完整

## 构建

```bash
npm run build
```

## 许可

MIT
