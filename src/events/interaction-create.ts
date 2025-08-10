import { Event } from "@src/handlers/events";
import { Client, Interaction } from "discord.js";

const event = new Event<[Client, Interaction]>(
  "interactionCreate",
  async (client, interaction) => {
    if (interaction.isCommand() || interaction.isContextMenuCommand()) {
      let command = client.commands.get(interaction.commandName);
      command.execute(client, interaction);
    }
  }
);

export default event;
