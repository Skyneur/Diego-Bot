import { ActivityType } from "discord.js";
import type { Config } from "@mytypes/config";

const isDev = process.env.NODE_ENV !== "production";

const config: Config = {
  language: "fr",
  prefix: "!",
  status: isDev ? "idle" : "online",
  activities: [
    {
      name: isDev ? "🛠️ Mode développement" : "✅ En production",
      type: ActivityType.Custom,
    },
  ],
  environment: isDev ? "development" : "production",
  version: "1.0.0",
  startupMessage: true,
  logChannelId: process.env.LOG_CHANNEL_ID || "",
};

export default config;
