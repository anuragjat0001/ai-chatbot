# NeuralChat — AI Chatbot Application

A production-grade AI chatbot application with a clean, modern UI and a Node.js backend.
Supports both **Anthropic Claude** and **OpenAI GPT** as AI providers.

---

## Project Structure

```
ai-chatbot/
├── frontend/
│   └── index.html          # Complete single-file frontend (HTML + CSS + JS)
├── backend/
│   ├── server.js           # Express API server
│   ├── package.json        # Node.js dependencies
│   └── .env.example        # Environment variable template
├── .gitignore
├── vercel.json             # Vercel deployment configuration
└── README.md
```

---

## Features

| Feature                  | Details                                      |
|--------------------------|----------------------------------------------|
| Chat interface           | ChatGPT-style with message bubbles           |
| Message history          | Full conversation context sent to the API    |
| Loading animation        | Animated typing indicator (three dots)       |
| Dark / Light mode        | Persistent across sessions (localStorage)   |
| Copy response button     | Copies raw message text to clipboard         |
| Clear chat button        | Resets conversation history                  |
| Error handling           | Toast notifications for API failures         |
| Mobile responsive        | Works on all screen sizes                    |
| Provider agnostic        | Switch between Claude and GPT via .env       |
| Markdown rendering       | Bold, italic, code blocks, inline code       |

---

## Prerequisites

- **Node.js** v18 or higher — [download](https://nodejs.org/)
- An **Anthropic API key** — [get one](https://console.anthropic.com/)
  — OR —
- An **OpenAI API key** — [get one](https://platform.openai.com/api-keys)

---

## Setup & Run Locally

### Step 1 — Clone / Download

```bash
git clone https://github.com/your-username/ai-chatbot.git
cd ai-chatbot
```

### Step 2 — Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3 — Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` in your editor and fill in your API key:

```env
# For Claude (default)
PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx

# For OpenAI instead, change to:
# PROVIDER=openai
# OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
```

### Step 4 — Start the Backend

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

You should see:
```
🚀 NeuralChat backend running on http://localhost:3001
   Provider : ANTHROPIC
   Health   : http://localhost:3001/api/health
```

### Step 5 — Open the Frontend

**Option A** — Let the backend serve it (recommended):
Open [http://localhost:3001](http://localhost:3001) in your browser.

**Option B** — Open directly:
Open `frontend/index.html` directly in your browser.
**Important:** Change `API_ENDPOINT` in `index.html` (line ~183) to the full URL:

```js
const API_ENDPOINT = 'http://localhost:3001/api/chat';
```

---

## Environment Variables Reference

| Variable           | Default                  | Description                             |
|--------------------|---------------------------|-----------------------------------------|
| `PROVIDER`         | `anthropic`              | AI provider: `anthropic` or `openai`    |
| `ANTHROPIC_API_KEY`| —                        | Your Anthropic API key                  |
| `CLAUDE_MODEL`     | `claude-opus-4-6`        | Claude model to use                     |
| `OPENAI_API_KEY`   | —                        | Your OpenAI API key                     |
| `OPENAI_MODEL`     | `gpt-4o`                 | GPT model to use                        |
| `PORT`             | `3001`                   | Server port                             |
| `MAX_TOKENS`       | `1024`                   | Max tokens in AI response               |
| `NODE_ENV`         | `development`            | Set to `production` when deploying      |
| `ALLOWED_ORIGIN`   | `*`                      | CORS allowed origin (lock down in prod) |
| `SYSTEM_PROMPT`    | Built-in NeuralChat prompt | Custom system prompt override          |

---

## Deploying to Vercel

### Prerequisites
- A [Vercel account](https://vercel.com) (free tier is sufficient)
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`

### Steps

**1. Push your project to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/ai-chatbot.git
git push -u origin main
```

**2. Import project to Vercel**

Option A — Via Vercel Dashboard:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your repository
3. Vercel auto-detects `vercel.json` — click **Deploy**

Option B — Via CLI:
```bash
cd ai-chatbot
vercel
```

**3. Add Environment Variables**

In your Vercel project dashboard:
1. Go to **Settings → Environment Variables**
2. Add each key from your `.env` file
   - `PROVIDER` = `anthropic`
   - `ANTHROPIC_API_KEY` = `sk-ant-api03-...`
   - `NODE_ENV` = `production`
   - Any others you need

**4. Redeploy**

```bash
vercel --prod
```

Your app is now live at `https://your-project.vercel.app` 🎉

### Important: Fix the API endpoint in frontend

Once deployed, update `frontend/index.html` line ~183:

```js
// Change from:
const API_ENDPOINT = 'http://localhost:3001/api/chat';

// To (Vercel uses relative paths automatically):
const API_ENDPOINT = '/api/chat';
```

---

## API Reference

### POST /api/chat

Send a message and receive an AI response.

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello, who are you?" },
    { "role": "assistant", "content": "I'm NeuralChat..." },
    { "role": "user", "content": "What can you help me with?" }
  ]
}
```

**Success response (200):**
```json
{
  "reply": "I can help with coding, writing, analysis, and much more!",
  "provider": "anthropic"
}
```

**Error response (400/500):**
```json
{
  "error": "Description of what went wrong"
}
```

### GET /api/health

Check if the server is running.

```json
{
  "status": "ok",
  "provider": "anthropic",
  "model": "claude-opus-4-6",
  "timestamp": "2025-06-04T12:00:00.000Z"
}
```

---

## Customization

### Change the AI persona / system prompt

In `.env`:
```env
SYSTEM_PROMPT=You are a concise coding assistant that only answers programming questions.
```

### Use a different Claude model

```env
# Fastest & cheapest
CLAUDE_MODEL=claude-haiku-4-5

# Balanced
CLAUDE_MODEL=claude-sonnet-4-6

# Most capable
CLAUDE_MODEL=claude-opus-4-6
```

### Increase response length

```env
MAX_TOKENS=4096
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ANTHROPIC_API_KEY is not set` | Check your `.env` file exists and has the key |
| `Failed to connect` in browser | Make sure `npm start` is running in `/backend` |
| CORS error in browser | Set `ALLOWED_ORIGIN` to your frontend's URL |
| 401 Unauthorized from API | Your API key is invalid or expired |
| 429 Too Many Requests | You've hit the API rate limit; wait and retry |
| Blank page after deploy | Check Vercel build logs for errors |

---

## License

MIT — free for personal and commercial use.
