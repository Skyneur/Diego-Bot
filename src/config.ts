import { ActivityType } from "discord.js";
import type { Config } from "@mytypes/config";


const ENV = {
  PRODUCTION: "production",
  DEVELOPMENT: "development"
};

const environment = process.env.NODE_ENV === ENV.PRODUCTION 
  ? ENV.PRODUCTION as "production" 
  : ENV.DEVELOPMENT as "development";
const isDev = environment === ENV.DEVELOPMENT;

const DEV_STARTUP_MESSAGE = true;
const sendStartupMsg = !isDev || DEV_STARTUP_MESSAGE;

const config: Config = {
  language: "fr",
  prefix: "!",
  version: "1.0.0",
  color: "#ea6434",
  
  environment: environment,
  
  // Activer l'enregistrement automatique des commandes au démarrage du bot
  autoRegisterCommands: true,
  
  status: isDev ? "idle" : "online",
  activities: [
    {
      name: isDev ? "🛠️ Mode développement" : "✅ En production",
      type: ActivityType.Custom,
    },
  ],
  
  startupMessage: sendStartupMsg,
  logChannelId: process.env.LOG_CHANNEL_ID || "1426588221323743374",
};

export default config;
