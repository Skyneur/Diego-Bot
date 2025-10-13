import config from "@src/config";
import { Event } from "@src/handlers/events";
import { Client, Message } from "discord.js";
import { Command } from "@src/handlers/commands";

const SPECIAL_USER_ID = "1126528170770837594";

const SPECIAL_COMPLIMENTS = [
  "T'es chanmé 🔥",
  "T'es un vrai bg 😎",
  "Mon roi des neuils 💯",
  "Le boss du game 👑",
  "Légende vivante, sérieux ✨",
  "T'assures grave, respect 👏",
  "T'es une machine 🔥⚡",
  "T'es dans une autre dimension 🚀",
  "Toujours frais, jamais fade 🧊",
  "Tu gères comme un chef 🍾",
  "100% MVP, t'es le GOAT 🐐"
];

function getRandomCompliment(): string {
  const randomIndex = Math.floor(Math.random() * SPECIAL_COMPLIMENTS.length);
  return SPECIAL_COMPLIMENTS[randomIndex];
}

const event = new Event<[Client, Message]>(
  "messageCreate",
  async (client, message) => {
    if (message.author.bot) return;
    
    if (message.author.id === SPECIAL_USER_ID) {
      if (Math.random() < 0.3) {
        const compliment = getRandomCompliment();
        await message.reply(compliment);
      }
    }
    
    if (message.content.startsWith(config.prefix)) {
      let array = message.content.split(" ");
      let args = array.slice(1);
      let commandName = array[0].slice(config.prefix.length);
      const command = client.commands.get(commandName);
      if (command && command instanceof Command) {
        command.execute(client, message, args);
      }
    }
  }
);

export default event;
