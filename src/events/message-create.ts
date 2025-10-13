import config from "@src/config";
import { Event } from "@src/handlers/events";
import { Client, Message } from "discord.js";
import { Command } from "@src/handlers/commands";

// ID de l'utilisateur spécial
const SPECIAL_USER_ID = "1126528170770837594";

// Liste de compliments pour l'utilisateur spécial
const SPECIAL_COMPLIMENTS = [
  "Tu es trop beau !",
  "Tu es le GOAT !",
  "Le roi des neuilles !",
  "La légende vivante !",
  "Incroyable comme toujours !",
  "Le meilleur d'entre nous !",
  "On ne mérite pas ton talent !",
  "Une présence majestueuse !",
  "Maître incontesté !",
  "Ton intelligence n'a d'égale que ta beauté !",
  "Une aura légendaire !",
  "Personne ne t'arrive à la cheville !",
  "Le génie incarné !",
  "Une inspiration pour nous tous !"
];

/**
 * Obtient un compliment aléatoire de la liste
 */
function getRandomCompliment(): string {
  const randomIndex = Math.floor(Math.random() * SPECIAL_COMPLIMENTS.length);
  return SPECIAL_COMPLIMENTS[randomIndex];
}

// Événement de traitement des messages
const event = new Event<[Client, Message]>(
  "messageCreate",
  async (client, message) => {
    if (message.author.bot) return;
    
    // Vérifier si c'est l'utilisateur spécial
    if (message.author.id === SPECIAL_USER_ID) {
      // 30% de chance de répondre avec un compliment
      if (Math.random() < 0.3) {
        const compliment = getRandomCompliment();
        await message.reply(compliment);
      }
    }
    
    // Traitement normal des commandes
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

// Export direct de l'événement
export default event;
