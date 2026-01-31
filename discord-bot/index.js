import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";

const token = process.env.DISCORD_TOKEN;
const apiUrl = process.env.VOLTARIS_API_URL || "http://localhost:8787/api/voltaris";
const allowedChannel = process.env.BOT_CHANNEL_ID || "";
const prefix = process.env.BOT_PREFIX || "!v";
const historyLimit = 12;

if (!token) {
  console.error("Missing DISCORD_TOKEN in .env");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

const historyMap = new Map();

function appendHistory(channelId, role, text) {
  if (!historyMap.has(channelId)) historyMap.set(channelId, []);
  const list = historyMap.get(channelId);
  list.push({ role, text });
  if (list.length > historyLimit) list.splice(0, list.length - historyLimit);
}

function getHistory(channelId) {
  return historyMap.get(channelId) ?? [];
}

function shouldRespond(message) {
  if (message.author.bot) return false;
  if (allowedChannel && message.channel?.id !== allowedChannel) return false;
  if (message.content.startsWith(prefix)) return true;
  if (message.mentions?.has(client.user)) return true;
  return false;
}

function extractPrompt(message) {
  let content = message.content ?? "";
  if (content.startsWith(prefix)) {
    return content.slice(prefix.length).trim();
  }
  if (message.mentions?.has(client.user)) {
    const mentionText = `<@${client.user.id}>`;
    content = content.replaceAll(mentionText, "").trim();
  }
  return content.trim();
}

async function callVoltaris(message, history) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history,
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || "Voltaris server error");
  }
  const data = await response.json();
  return data.reply || "No response.";
}

client.on("ready", () => {
  console.log(`Voltaris bot logged in as ${client.user?.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!shouldRespond(message)) return;
  const prompt = extractPrompt(message);
  if (!prompt) return;

  if (prompt.toLowerCase() === "reset") {
    historyMap.delete(message.channel.id);
    await message.reply("Context reset.");
    return;
  }

  try {
    await message.channel.sendTyping();
    appendHistory(message.channel.id, "user", prompt);
    const reply = await callVoltaris(prompt, getHistory(message.channel.id));
    appendHistory(message.channel.id, "assistant", reply);
    await message.reply(reply.slice(0, 1800));
  } catch (error) {
    await message.reply(`Error: ${error?.message || "Failed to contact Voltaris."}`);
  }
});

client.login(token);
