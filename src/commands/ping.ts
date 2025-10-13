import { Command } from "@src/handlers/commands";
import { Client, Message, EmbedBuilder, ColorResolvable, CommandInteraction, version as discordJsVersion } from "discord.js";
import { _T } from "@src/utils/translator";
import os from "os";

const command = new Command<[Client, Message | CommandInteraction]>(
  "slash",
  "ping",
  "Afficher les informations de latence et système du bot",
  null,
  [],
  async (client, interaction) => {
    const isSlash = interaction instanceof CommandInteraction;
    const startTime = Date.now();
    
    const initialEmbed = new EmbedBuilder()
      .setTitle("🏓 Ping en cours...")
      .setDescription("Calcul de la latence en cours...")
      .setColor("#FFA500" as ColorResolvable)
      .setTimestamp();
    
    let initialResponse;
    if (isSlash) {
      initialResponse = await interaction.reply({ embeds: [initialEmbed], fetchReply: true });
    } else {
      initialResponse = await (interaction as Message).reply({ embeds: [initialEmbed] });
    }
    
    const apiLatency = Date.now() - startTime;
    const wsLatency = client.ws.ping;
    const uptime = formatUptime(client.uptime || 0);
    
    // Statistiques système
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    const memoryTotalMB = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
    const cpuUsage = os.loadavg()[0].toFixed(2);
    const osType = `${os.type()} ${os.release()}`;
    const serverCount = client.guilds.cache.size;
    const userCount = client.users.cache.size;
    
    const finalEmbed = new EmbedBuilder()
      .setTitle("🏓 Pong!")
      .setDescription(`Le bot est opérationnel !`)
      .setColor("#00FF00" as ColorResolvable)
      .addFields(
        { name: "📡 Latence API", value: `\`${apiLatency}ms\``, inline: true },
        { name: "🌐 Latence WebSocket", value: `\`${wsLatency}ms\``, inline: true },
        { name: "⏱️ Uptime", value: `\`${uptime}\``, inline: true },
        { name: "🖥️ Système", value: `\`${osType}\``, inline: true },
        { name: "📊 Mémoire", value: `\`${memoryUsedMB}MB / ${memoryTotalMB}MB\``, inline: true },
        { name: "🔄 CPU", value: `\`${cpuUsage}%\``, inline: true },
        { name: "🤖 Discord.js", value: `\`v${discordJsVersion}\``, inline: true },
        { name: "📂 Serveurs", value: `\`${serverCount}\``, inline: true },
        { name: "👥 Utilisateurs", value: `\`${userCount}\``, inline: true }
      )
      .setFooter({ text: `Demandé par ${isSlash ? (interaction as CommandInteraction).user.tag : (interaction as Message).author.tag}` })
      .setTimestamp();
    
    if (isSlash) {
      await (interaction as CommandInteraction).editReply({ embeds: [finalEmbed] });
    } else {
      if (initialResponse instanceof Message) {
        await initialResponse.edit({ embeds: [finalEmbed] });
      }
    }
  }
);

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return `${days}j ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
}

export default command;
