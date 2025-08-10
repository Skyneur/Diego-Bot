import { Command } from "@src/handlers/commands";
import { Client, Message } from "discord.js";

const command = new Command<[Client, Message]>(
  "basic",
  "ping",
  "receive pong",
  null,
  [],
  async (client, message) => {
    message.reply("Pong !");
  }
);

export default command;
