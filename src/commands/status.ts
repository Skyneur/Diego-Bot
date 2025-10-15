import { Client, CommandInteraction, EmbedBuilder, ColorResolvable } from "discord.js";
import { Command } from "@src/handlers/commands";
import { _T } from "@src/utils/translator";
import { Emojis, getEmoji } from "@src/constants/emojis";
import { EmojiUtils } from "@src/utils/emojiUtils";
import os from "os";
import config from "@src/config";

const command = new Command<[Client, CommandInteraction]>(
  "slash",
  "status",
  "Affiche l'état actuel du bot",
  null,
  [],
  async (client, interaction) => {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const uptimeStr = `${days}j ${hours}h ${minutes}m ${seconds}s`;
    const memUsage = process.memoryUsage();
    const memoryUsed = (memUsage.rss / 1024 / 1024).toFixed(2);
    
    const status = client.user?.presence.status || "online";
    const statusEmoji = EmojiUtils.getStatusEmoji(status);
    const connectionEmoji = EmojiUtils.getConnectionEmoji(client.ws.ping);
    
    const embed = new EmbedBuilder()
      .setTitle(`${getEmoji('ROCKET')} **État du bot**`)
      .setColor(config.color as ColorResolvable)
      .addFields(
        { name: `${statusEmoji} **Statut**`, value: `\`${status}\``, inline: true },
        { name: `${connectionEmoji} **Latence**`, value: `\`${Math.max(0, client.ws.ping)}ms\``, inline: true },
        { name: `${getEmoji('FOLDER')} **Serveurs**`, value: `\`${client.guilds.cache.size}\``, inline: true },
        
        { name: `${getEmoji('CLOCK')} **Uptime**`, value: `\`${uptimeStr}\``, inline: true },
        { name: `${getEmoji('GEAR')} **Mémoire**`, value: `\`${memoryUsed} MB\``, inline: true },
        { name: `${getEmoji('NOTEPAD')} **Version**`, value: `\`${config.version}\``, inline: true }
      )
      .setFooter({ text: `Environnement: ${config.environment}` })
      .setTimestamp();
      
    await interaction.reply({ embeds: [embed] });
  }
);

export default command;