/**

* NeuralChat Backend — server.js
* Node.js + Express API server using Groq Llama3 model
  */

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Provider
const PROVIDER = "groq";

// Health check
app.get("/api/health", (req, res) => {
res.json({
status: "ok",
provider: PROVIDER,
model: "llama3-70b-8192",
timestamp: new Date().toISOString()
});
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {

try {

const { messages } = req.body;

if (!messages || !Array.isArray(messages)) {
  return res.status(400).json({
    error: "Messages array required"
  });
}

const response = await fetch(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: messages
    })
  }
);

const data = await response.json();

const reply =
  data?.choices?.[0]?.message?.content ||
  "No response from Groq";

return res.json({
  reply: reply,
  provider: PROVIDER
});

} catch (error) {

console.error("NeuralChat Error:", error);

return res.status(500).json({
  error: "Server error while processing request"
});

}

});

// Catch-all route (frontend)
app.get("*", (req, res) => {
res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start server
app.listen(PORT, () => {
console.log("NeuralChat running on port " + PORT);
});
