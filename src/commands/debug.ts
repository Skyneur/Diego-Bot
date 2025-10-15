import { Command } from "@src/handlers/commands";
import { Client, CommandInteraction, EmbedBuilder, ColorResolvable, MessageFlags } from "discord.js";
import { _T } from "@src/utils/translator";
import { getEmoji } from "@src/constants/emojis";
import config from "@src/config";
import fs from "fs";
import path from "path";

const command = new Command<[Client, CommandInteraction]>(
  "slash",
  "debug",
  "Afficher des informations de débogage pour le bot",
  null,
  [],
  async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle(`${getEmoji("GEAR")} **Informations de débogage**`)
      .setDescription("*Voici les informations de débogage du bot.*")
      .setColor(config.color as ColorResolvable)
      .setTimestamp();

    const commandFiles = fs.readdirSync(path.join(process.cwd(), "src/commands"))
      .filter(file => file.endsWith(".ts"));
    
    const loadedCommands = Array.from(client.commands.keys());
    embed.addFields(
      { name: `${getEmoji("FOLDER")} **Fichiers de commandes**`, value: commandFiles.length > 0 ? `\`\`\`\n${commandFiles.join("\n")}\`\`\`` : "Aucun fichier trouvé", inline: false },
      { name: `${getEmoji("GEAR")} **Commandes chargées**`, value: loadedCommands.length > 0 ? `\`\`\`\n${loadedCommands.join("\n")}\`\`\`` : "Aucune commande chargée", inline: false },
      { name: `${getEmoji("ROCKET")} **Nombre de serveurs**`, value: `\`${client.guilds.cache.size}\``, inline: true },
      { name: `${getEmoji("GLOBE")} **Utilisateurs visibles**`, value: `\`${client.users.cache.size}\``, inline: true },
      { name: `${getEmoji("ROCKET")} **Latence API**`, value: `\`${client.ws.ping}ms\``, inline: true },
      { name: `${getEmoji("CLOCK")} **Uptime**`, value: `\`${formatUptime(client.uptime || 0)}\``, inline: true },
      { name: `${getEmoji("GLOBE")} **Mode**`, value: `\`${config.environment}\``, inline: true },
      { name: `${getEmoji("NOTEPAD")} **Version**`, value: `\`${config.version}\``, inline: true }
    );
    
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
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