import { Event } from "@src/handlers/events";
import { Client, Interaction } from "discord.js";

const event = new Event<[Client, Interaction]>(
  "interactionCreate",
  async (client, interaction) => {
    if (interaction.isCommand() || interaction.isContextMenuCommand()) {
      try {
        let command = client.commands.get(interaction.commandName);
        if (command) {
          await command.execute(client, interaction);
        }
      } catch (error) {
        console.error(`Erreur avec la commande ${interaction.commandName}:`, error);
      }
    }
  }
);

// Export direct de l'événement
export default event;
