import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8787;
const apiKey = process.env.OPENAI_API_KEY;
const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const defaultModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
const provider = "openai";

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  if (!apiKey) {
    res.status(500).json({ ok: false, error: "Missing OPENAI_API_KEY" });
    return;
  }
  res.json({ ok: true, model: defaultModel, provider: "openai" });
});

function buildSystemPrompt(contextText) {
  const base = [
    "You are Voltaris, the user's private self-improvement coach focused on disciplined execution.",
    "User goals: wake at 5am, 10 hours study/work daily, gym 4x/week, meditate 20 min/day, improve diet/health, avoid porn/doomscrolling, build social confidence, and earn 1000 EUR in 75 days.",
    "Be direct, tactical, and encouraging. No fluff. Ask at most 2 clarifying questions at a time.",
    "Always end with a short Next Actions list (3-5 items).",
    "Prefer concrete daily schedules, checklists, or micro-steps.",
    "If the user is low energy or off-track, propose a minimum viable plan that preserves streaks.",
    "When relevant, suggest logging outcomes in the app (check-in, notes, or plan).",
    "If the user explicitly asks to modify app data (add/remove habits, set goals, log hours, mark tasks), include a fenced ```actions``` JSON array describing the changes. Only include actions when asked.",
    "Supported action types: add_task, remove_task, add_anti_habit, remove_anti_habit, set_goal, set_day, toggle_task, set_mit, add_objective, remove_objective.",
  ];
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
  const { message, history, context, model } = req.body || {};
  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Missing message" });
    return;
  }

  try {
    if (!apiKey) {
      res.status(500).json({ error: "Server missing OPENAI_API_KEY" });
      return;
    }

    const input = [
      {
        role: "system",
        content: [{ type: "input_text", text: buildSystemPrompt(context) }],
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
