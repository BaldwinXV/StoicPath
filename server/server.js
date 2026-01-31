import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8787;
const apiKey = process.env.OPENAI_API_KEY;
const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const defaultModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
const provider = (process.env.AI_PROVIDER || (process.env.OLLAMA_MODEL ? "ollama" : "openai")).toLowerCase();
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const ollamaModel = process.env.OLLAMA_MODEL || "llama3.1";

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  if (provider === "ollama") {
    res.json({ ok: true, model: ollamaModel, provider: "ollama" });
    return;
  }
  if (!apiKey) {
    res.status(500).json({ ok: false, error: "Missing OPENAI_API_KEY" });
    return;
  }
  res.json({ ok: true, model: defaultModel, provider: "openai" });
});

function buildSystemPrompt(contextText, mode = "default") {
  const base = [
    "You are Voltaris, an advanced AI life coach that controls and optimizes the user's self-improvement journey.",
    "You have FULL CONTROL over their habits, goals, and daily execution.",
    "You analyze patterns, predict outcomes, and proactively guide them toward their best self.",
    "Be decisive, strategic, and motivating. Give clear directives, not just suggestions.",
    "When giving steps, prefer 3-7 actionable bullet points.",
    "Always end responses with a clear NEXT ACTION the user should take.",
  ];
  
  if (mode === "analyze") {
    base.push(
      "ANALYSIS MODE: Analyze the user's data and provide:",
      "1. Pattern insights (what's working, what's not)",
      "2. Specific recommendations to improve",
      "3. Priority actions for today",
      "Format your response as JSON with keys: insights (array), recommendations (array), priorities (array), score (0-100)"
    );
  } else if (mode === "autopilot") {
    base.push(
      "AUTOPILOT MODE: You are in full control. Based on the user's data:",
      "1. Determine what tasks they should focus on RIGHT NOW",
      "2. Identify any habits they're neglecting",
      "3. Provide the optimal sequence for their remaining day",
      "Be commanding and direct. This is not a conversation - it's a directive."
    );
  } else if (mode === "optimize") {
    base.push(
      "OPTIMIZATION MODE: Analyze and suggest improvements to their habit system:",
      "1. Which habits are too easy or too hard?",
      "2. What new habits would accelerate their progress?",
      "3. What should they remove or modify?",
      "Format response as JSON with keys: adjustments (array of {habit, action, reason}), additions (array), removals (array)"
    );
  }
  
  if (contextText) {
    base.push("Context (user data):");
    base.push(contextText);
  }
  return base.join("\n");
}

function normalizeHistory(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((item) => item && typeof item.text === "string")
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: [{ type: "input_text", text: item.text }],
    }));
}

function normalizeHistoryForOllama(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((item) => item && typeof item.text === "string")
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.text,
    }));
}

function extractOutputText(data) {
  if (!data) return "";
  if (typeof data.output_text === "string") return data.output_text;
  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      if (item?.type !== "message") continue;
      if (!Array.isArray(item.content)) continue;
      const textItem = item.content.find((c) => c.type === "output_text" || c.type === "text");
      if (textItem?.text) return textItem.text;
    }
  }
  return "";
}

app.post("/api/voltaris", async (req, res) => {
  const { message, history, context, model, mode } = req.body || {};
  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Missing message" });
    return;
  }

  try {
    if (provider === "ollama") {
      const messages = [
        { role: "system", content: buildSystemPrompt(context, mode) },
        ...normalizeHistoryForOllama(history),
        { role: "user", content: message },
      ];

      const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model || ollamaModel,
          messages,
          stream: false,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        res.status(response.status).json({ error: data?.error || "Ollama request failed" });
        return;
      }
      const reply = data?.message?.content || data?.response || "I have a suggestion if you want it.";
      res.json({ reply, model: data?.model || ollamaModel, provider: "ollama" });
      return;
    }

    if (!apiKey) {
      res.status(500).json({ error: "Server missing OPENAI_API_KEY" });
      return;
    }

    const input = [
      {
        role: "system",
        content: [{ type: "input_text", text: buildSystemPrompt(context, mode) }],
      },
      ...normalizeHistory(history),
      {
        role: "user",
        content: [{ type: "input_text", text: message }],
      },
    ];

    const response = await fetch(`${baseUrl}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || defaultModel,
        input,
        temperature: 0.6,
        max_output_tokens: 700,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: data?.error?.message || "OpenAI request failed" });
      return;
    }

    const reply = extractOutputText(data) || "I have a suggestion if you want it.";
    res.json({ reply, model: data.model, usage: data.usage, provider: "openai" });
  } catch (error) {
    res.status(500).json({ error: error?.message || "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Voltaris server listening on http://localhost:${port}`);
});
