import { Command } from "@src/handlers/commands";
import { Client, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable } from "discord.js";
import { _T } from "@src/utils/translator";
import { getEmoji } from "@src/constants/emojis";
import config from "@src/config";

const command = new Command<[Client, ChatInputCommandInteraction]>(
  "slash",
  "help",
  "Afficher la liste des commandes disponibles",
  null,
  [],
  async (client, interaction) => {
    const commands = Array.from(client.commands.values());
    
    interface CommandInfo {
      name: string;
      description: string;
    }
    const categories: Record<string, CommandInfo[]> = {
      "Informations": [],
      "Utilitaires": [],
      "Amusement": [],
      "Système": [],
      "Autres": []
    };
    
    for (const cmd of commands) {
      if (cmd.type !== "slash") continue;
      
      const commandName = cmd.name;
      const commandDesc = cmd.description;
      
      if (["ping", "serverinfo", "userinfo", "avatar"].includes(commandName)) {
        categories["Informations"].push({ name: commandName, description: commandDesc });
      } else if (["debug"].includes(commandName)) {
        categories["Système"].push({ name: commandName, description: commandDesc });
      } else if (["roll", "emoji", "emojis"].includes(commandName)) {
        categories["Amusement"].push({ name: commandName, description: commandDesc });
      } else if (["help"].includes(commandName)) {
        categories["Utilitaires"].push({ name: commandName, description: commandDesc });
      } else {
        categories["Autres"].push({ name: commandName, description: commandDesc });
      }
    }
    
    const embed = new EmbedBuilder()
      .setTitle(`\`📚\` **Aide - Liste des commandes**`)
      .setDescription(`*Voici la liste de toutes les commandes disponibles.*`)
      .setColor(config.color as ColorResolvable)
      .setFooter({ text: `${commands.length} commandes disponibles • Demandé par ${interaction.user.tag}` })
      .setTimestamp();
    for (const [category, cmds] of Object.entries(categories)) {
      if (cmds.length > 0) {
        let commandList = '';
        
        for (const cmd of cmds) {
          commandList += `\`/${cmd.name}\` - ${cmd.description}\n`;
        }
        
        embed.addFields({
          name: `\`${getCategoryIcon(category)}\` **${category}** (${cmds.length})`,
          value: commandList,
          inline: false
        });
      }
    }
    
    await interaction.reply({ embeds: [embed] });
  }
);
function getCategoryIcon(category: string): string {
  switch (category) {
    case 'Informations': return getEmoji('GLOBE');
    case 'Utilitaires': return getEmoji('GEAR');
    case 'Amusement': return '🎮';
    case 'Système': return getEmoji('GEAR');
    case 'Autres': return getEmoji('NOTEPAD');
    default: return '📌';
  }
}

export default command;