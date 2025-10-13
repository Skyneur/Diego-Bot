import { Event } from "@src/handlers/events";
import { Client, EmbedBuilder, Interaction } from "discord.js";

const event = new Event<[Client, Interaction]>(
  "interactionCreate",
  async (client, interaction) => {
    if (interaction.isCommand() || interaction.isContextMenuCommand()) {
      try {
        // Récupérer la commande sans logs détaillés
        let command = client.commands.get(interaction.commandName);
        
        if (command) {
          await command.execute(client, interaction);
        } else {
          console.log(`ALERTE: Commande non trouvée: ${interaction.commandName}`);
          console.log(`Commandes disponibles:`, Array.from(client.commands.keys()));
          
          // Informer l'utilisateur que la commande n'est pas reconnue
          if (interaction.isRepliable()) {
            const errorEmbed = new EmbedBuilder()
              .setTitle("`❌` **Commande non reconnue**")
              .setDescription(`La commande \`/${interaction.commandName}\` n'est pas reconnue par le bot.`)
              .setColor("Red")
              .setTimestamp()
              .addFields(
                { name: "Solution", value: "Essayez d'utiliser la commande `/cleaner action:Nettoyer les commandes` pour resynchroniser toutes les commandes." }
              );
              
            await interaction.reply({
              embeds: [errorEmbed],
              ephemeral: true
            });
          }
        }
      } catch (error) {
        console.error(`Erreur avec la commande ${interaction.commandName}:`, error);
        
        // Informer l'utilisateur de l'erreur
        if (interaction.isRepliable() && !interaction.replied) {
          const errorEmbed = new EmbedBuilder()
            .setTitle("`❌` **Erreur**")
            .setDescription(`Une erreur s'est produite lors de l'exécution de la commande \`/${interaction.commandName}\`.`)
            .setColor("Red")
            .setTimestamp();
            
          await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
          });
        }
      }
    }
  }
);

// Export direct de l'événement
export default event;
