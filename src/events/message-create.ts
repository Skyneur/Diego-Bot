import config from "@src/config";
import { Event } from "@src/handlers/events";
import { Client, Message } from "discord.js";
import { Command } from "@src/handlers/commands";

const event = new Event<[Client, Message]>(
  "messageCreate",
  async (client, message) => {
    if (message.author.bot) return;
    
    // Traitement des commandes préfixées (nécessite MessageContent intent)
    if (message.content.startsWith(config.prefix)) {
      let array = message.content.split(" ");
      let args = array.slice(1);
      let commandName = array[0].slice(config.prefix.length);
      const command = client.commands.get(commandName);
      if (command && command instanceof Command) {
        command.execute(client, message, args);
      }
    }
    return;
  }
);

export default event;
