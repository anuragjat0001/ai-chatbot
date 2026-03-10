/**
 * NeuralChat Backend — server.js
 * Node.js + Express API server that proxies requests to the Anthropic Claude API.
 * Supports both Claude (Anthropic) and OpenAI — switch via PROVIDER env variable.
 */

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));

// Serve frontend in production
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Provider Config ───────────────────────────────────────────────────────────
const PROVIDER          =  'groq';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY    = process.env.OPENAI_API_KEY;
const MAX_TOKENS        = parseInt(process.env.MAX_TOKENS || '1024', 10);
const SYSTEM_PROMPT     = process.env.SYSTEM_PROMPT ||
  'You are NeuralChat, a helpful, precise, and intelligent AI assistant. ' +
  'Be concise but thorough. Use markdown formatting when appropriate for code, lists, and structure.';

// ─── Validation ────────────────────────────────────────────────────────────────
function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'Messages must be a non-empty array.';
  }
  for (const m of messages) {
    if (!m.role || !m.content) return 'Each message must have role and content.';
    if (!['user', 'assistant'].includes(m.role)) return `Invalid role: ${m.role}`;
    if (typeof m.content !== 'string' || m.content.trim().length === 0)
      return 'Message content must be a non-empty string.';
  }
  // Ensure conversation ends with a user message
  if (messages[messages.length - 1].role !== 'user') {
    return 'Last message must be from the user.';
  }
  return null;
}
async function callGroq(messages) {

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: messages.map(m => ({ role: m.role, content: m.content }))
  });

  const data = await response.json();

  return data.choices?.[0]?.message?.content || "No response from Groq";
}
// ─── Chat Endpoint ─────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Validate input
    const validationError = validateMessages(messages);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Enforce max history length (last 20 messages to control token usage)
    const trimmedMessages = messages.slice(-20);

    // Call the appropriate provider
   let reply;
    reply = await callGroq(trimmedMessages);

    return res.json({ reply, provider: PROVIDER });

  } catch (err) {
    console.error('[NeuralChat] API Error:', err.message);

    // Don't expose internal errors in production
    const isDev = process.env.NODE_ENV !== 'production';
    return res.status(500).json({
      error: isDev ? err.message : 'An error occurred while processing your request.',
    });
  }
});

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    provider: PROVIDER,
    model: PROVIDER === 'openai'
      ? (process.env.OPENAI_MODEL || 'gpt-4o')
      : (process.env.CLAUDE_MODEL || 'claude-opus-4-6'),
    timestamp: new Date().toISOString(),
  });
});

// ─── Catch-all: serve frontend ─────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 NeuralChat backend running on http://localhost:${PORT}`);
  console.log(`   Provider : ${PROVIDER.toUpperCase()}`);
  console.log(`   Env      : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health   : http://localhost:${PORT}/api/health\n`);
});
