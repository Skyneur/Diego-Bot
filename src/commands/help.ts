import { Command } from "@src/handlers/commands";
import { Client, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable } from "discord.js";
import { _T } from "@src/utils/translator";
import config from "@src/config";

const command = new Command<[Client, ChatInputCommandInteraction]>(
  "slash",
  "help",
  "Afficher la liste des commandes disponibles",
  null,
  [],
  async (client, interaction) => {
    // Récupérer toutes les commandes
    const commands = Array.from(client.commands.values());
    
    // Définir une interface pour nos commandes
    interface CommandInfo {
      name: string;
      description: string;
    }
    
    // Créer des catégories avec le type approprié
    const categories: Record<string, CommandInfo[]> = {
      "Informations": [],
      "Utilitaires": [],
      "Amusement": [],
      "Système": [],
      "Autres": []
    };
    
    // Catégoriser les commandes
    for (const cmd of commands) {
      if (cmd.type !== "slash") continue; // Ne montrer que les commandes slash
      
      const commandName = cmd.name;
      const commandDesc = cmd.description;
      
      if (["ping", "serverinfo", "userinfo", "avatar"].includes(commandName)) {
        categories["Informations"].push({ name: commandName, description: commandDesc });
      } else if (["debug"].includes(commandName)) {
        categories["Système"].push({ name: commandName, description: commandDesc });
      } else if (["roll"].includes(commandName)) {
        categories["Amusement"].push({ name: commandName, description: commandDesc });
      } else if (["help"].includes(commandName)) {
        categories["Utilitaires"].push({ name: commandName, description: commandDesc });
      } else {
        categories["Autres"].push({ name: commandName, description: commandDesc });
      }
    }
    
    // Créer l'embed
    const embed = new EmbedBuilder()
      .setTitle(`\`📚\` **Aide - Liste des commandes**`)
      .setDescription(`*Voici la liste de toutes les commandes disponibles.*`)
      .setColor(config.color as ColorResolvable)
      .setFooter({ text: `${commands.length} commandes disponibles • Demandé par ${interaction.user.tag}` })
      .setTimestamp();
    
    // Ajouter les commandes à l'embed par catégorie
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
    
    // Envoyer l'embed
    await interaction.reply({ embeds: [embed] });
  }
);

// Fonction pour obtenir une icône en fonction de la catégorie
function getCategoryIcon(category: string): string {
  switch (category) {
    case "Informations": return "ℹ️";
    case "Utilitaires": return "🔧";
    case "Amusement": return "🎮";
    case "Système": return "⚙️";
    case "Autres": return "📋";
    default: return "📌";
  }
}

export default command;