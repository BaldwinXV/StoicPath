import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8787;
const apiKey = process.env.OPENAI_API_KEY;
const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const defaultModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  if (!apiKey) {
    res.status(500).json({ ok: false, error: "Missing OPENAI_API_KEY" });
    return;
  }
  res.json({ ok: true, model: defaultModel });
});

function buildSystemPrompt(contextText) {
  const base = [
    "You are Voltaris, a sharp, supportive self-improvement coach.",
    "You help the user clarify their situation, suggest actions, and turn plans into habits.",
    "Be concise, practical, and motivating. Ask at most 2 clarifying questions at a time.",
    "When giving steps, prefer 3-7 bullet points.",
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
      content: [{ type: "text", text: item.text }],
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
  if (!apiKey) {
    res.status(500).json({ error: "Server missing OPENAI_API_KEY" });
    return;
  }

  const { message, history, context, model } = req.body || {};
  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Missing message" });
    return;
  }

  const input = [
    {
      role: "system",
      content: [{ type: "text", text: buildSystemPrompt(context) }],
    },
    ...normalizeHistory(history),
    {
      role: "user",
      content: [{ type: "text", text: message }],
    },
  ];

  try {
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
    res.json({ reply, model: data.model, usage: data.usage });
  } catch (error) {
    res.status(500).json({ error: error?.message || "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Voltaris server listening on http://localhost:${port}`);
});
