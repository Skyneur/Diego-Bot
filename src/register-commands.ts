import { Client, GatewayIntentBits, Collection } from "discord.js";
import { Command } from "@src/handlers/commands";
import { Console } from "@src/utils/console/namespace";
import config from "@src/config";
import dotenv from "dotenv";

// Configuration de l'environnement
dotenv.config();

// Création d'un client Discord minimal pour enregistrer les commandes
const registerClient = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// Ajout de la collection de commandes
registerClient.commands = new Collection<string, Command>();

// Fonction pour enregistrer les commandes
const registerCommands = async () => {
  Console.box("^b", "Enregistrement des commandes", [
    { type: "info", content: "Démarrage de l'enregistrement des commandes..." }
  ]);

  try {
    // Importation du gestionnaire de commandes
    const { handleCommands } = require("./handlers/commands");
    
    // Enregistrement des commandes
    await handleCommands(registerClient);
    
    Console.box("^g", "Succès", [
      { type: "success", content: "Toutes les commandes ont été enregistrées avec succès!" },
      { type: "info", content: "Vous pouvez maintenant redémarrer le bot pour les utiliser." }
    ]);
  } catch (error) {
    Console.box("^r", "Erreur", [
      { type: "error", content: `Erreur lors de l'enregistrement des commandes: ${error}` }
    ]);
  } finally {
    // Déconnexion du client
    registerClient.destroy();
    process.exit(0);
  }
};

// Connexion au client Discord
registerClient.once("ready", () => {
  Console.box("^g", "Connecté", [
    { type: "success", content: `Connecté en tant que ${registerClient.user?.tag}` },
    { type: "info", content: "Enregistrement des commandes en cours..." }
  ]);
  
  // Enregistrer les commandes
  registerCommands();
});

// Connexion à Discord
registerClient.login(process.env.TOKEN);