import dotenv from "dotenv";
dotenv.config();
const events = require("discord-events.js");
import { handleEvents } from "./handlers/events";
import { Client, Collection, GatewayIntentBits, TextChannel, EmbedBuilder, ColorResolvable } from "discord.js";
import { _T } from "./utils/translator";
import config from "@src/config";
import { Console } from "@src/utils/console/namespace";
import { handleCommands } from "./handlers/commands";
import os from "os";
import { Emojis } from "./constants/emojis";
import { EmojiUtils } from "./utils/emojiUtils";
import "./types/discord";

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
bot.commands = new Collection();

bot.login(process.env.TOKEN).then(async () => {
  const intentsBitfield = bot.options.intents.bitfield;
  const intentsCount = intentsBitfield.toString(2).replace(/0/g, "").length;
  
  Console.box("^g", _T("login"), [
    {
      type: "success",
      content: _T("login_success", { tag: bot.user?.tag }),
    },
    {
      type: "default",
      content: _T("date", { date: new Date().toLocaleString() }),
    },
    {
      type: "default",
      content: _T("intents_count", { count: intentsCount }),
    },
    {
      type: "info",
      content: `Mode: ${config.environment}`,
    },
  ]);
  
  Console.box("^y", "Informations", [
    { type: "info", content: `Environnement: ${config.environment}` },
    { type: "info", content: `Message de démarrage: ${config.startupMessage ? "Activé" : "Désactivé"}` }
  ]);
  
  await handleEvents(bot);
  
  await handleCommands(bot);
  
  bot.user?.setPresence({
    activities: config.activities,
    status: config.status,
  });
  
  if (config.startupMessage && config.logChannelId) {
    try {
      const logChannel = await bot.channels.fetch(config.logChannelId);
      if (logChannel && logChannel.isTextBased()) {
        const safeNumber = (n: number | undefined) => Math.max(0, n ?? 0);

        const startupEmbed = new EmbedBuilder()
          .setTitle(`${Emojis.ROCKET} **Bot démarré**`)
          .setDescription(`*Le bot a démarré avec succès en mode **${config.environment}**.*`)
          .setColor(config.color as ColorResolvable)
          .addFields(
            { name: `${Emojis.GEAR} **Système**`, value: `\`${os.type()} ${os.release()}\``, inline: true },
            { name: `${Emojis.CLOCK} **Démarré à**`, value: `\`${new Date().toLocaleString()}\``, inline: true },
            { name: `${Emojis.NOTEPAD} **Version**`, value: `\`${config.version}\``, inline: true },
            { name: `${Emojis.WRENCH} **Environnement**`, value: `\`${config.environment}\``, inline: true },
            { name: `${EmojiUtils.getConnectionEmoji(bot.ws.ping)} **Latence**`, value: `\`${Math.max(0, bot.ws.ping)}ms\``, inline: true },
            { name: `${Emojis.FOLDER} **Serveurs**`, value: `\`${safeNumber(bot.guilds.cache.size)}\``, inline: true }
          )
          .setTimestamp();
        
        const textChannel = logChannel as TextChannel;
        await textChannel.send({ embeds: [startupEmbed] });
        
        Console.box("^b", "Startup message", [
          { type: "success", content: "Message de démarrage envoyé dans le canal configuré" }
        ]);
      }
    } catch (error) {
      Console.box("^r", "Startup message", [
        { type: "error", content: `Erreur lors de l'envoi du message de démarrage: ${error}` }
      ]);
    }
  } else if (config.environment === "development") {
    Console.box("^b", "Startup message", [
      { type: "info", content: "Messages de démarrage désactivés en mode développement" }
    ]);
  }
});
