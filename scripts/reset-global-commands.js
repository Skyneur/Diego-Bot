const dotenv = require("dotenv");
dotenv.config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Une fonction simple pour obtenir un timestamp
const getTimestamp = () => `[${new Date().toLocaleTimeString()}]`;

// Fonction pour créer des messages avec couleur dans la console
const consoleLog = (message, type = "info") => {
  const colors = {
    info: "\x1b[36m", // Cyan
    success: "\x1b[32m", // Vert
    warning: "\x1b[33m", // Jaune
    error: "\x1b[31m", // Rouge
    reset: "\x1b[0m" // Reset
  };
  
  console.log(`${colors[type]}${getTimestamp()} ${message}${colors.reset}`);
};

// Fonction pour extraire les commandes
async function extractCommands() {
  const commands = [];
  const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith(".ts"));
  
  consoleLog(`Recherche des commandes...`, "info");
  consoleLog(`${commandFiles.length} fichiers de commandes trouvés`, "info");
  
  for (const file of commandFiles) {
    try {
      const commandPath = path.join(process.cwd(), "src", "commands", file);
      const commandContent = fs.readFileSync(commandPath, 'utf8');
      
      // Extraction des informations de la commande à partir du contenu du fichier
      try {
        // Extraire le nom et la description
        const nameMatch = commandContent.match(/new Command[^(]*\([^"]*"slash",\s*"([^"]+)",\s*"([^"]+)"/);
        
        if (nameMatch && nameMatch.length >= 3) {
          const commandName = nameMatch[1];
          const commandDescription = nameMatch[2];
          
          // Extraire les options si présentes
          const options = [];
          const optionBlocks = commandContent.match(/{\s*name:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*type:\s*"([^"]+)",\s*required:\s*([^,]+)(?:,\s*choices:\s*\[([^\]]+)\])?\s*}/g);
          
          if (optionBlocks) {
            for (const optionBlock of optionBlocks) {
              const nameMatch = optionBlock.match(/name:\s*"([^"]+)"/);
              const descMatch = optionBlock.match(/description:\s*"([^"]+)"/);
              const typeMatch = optionBlock.match(/type:\s*"([^"]+)"/);
              const requiredMatch = optionBlock.match(/required:\s*([^,\s]+)/);
              
              if (nameMatch && descMatch && typeMatch) {
                const optionName = nameMatch[1];
                const optionDesc = descMatch[1];
                const optionType = typeMatch[1];
                const optionRequired = requiredMatch ? (requiredMatch[1] === "true") : false;
                
                // Conversion du type de l'option
                const optionTypeMap = {
                  "String": 3,
                  "Integer": 4,
                  "Boolean": 5,
                  "User": 6,
                  "Channel": 7,
                  "Role": 8,
                  "Mentionable": 9,
                  "Number": 10,
                  "Attachment": 11
                };
                
                const option = {
                  name: optionName,
                  description: optionDesc,
                  type: optionTypeMap[optionType] || 3,
                  required: optionRequired
                };
                
                // Extraction des choix si présents
                const choicesMatch = optionBlock.match(/choices:\s*\[([^\]]+)\]/);
                if (choicesMatch) {
                  const choicesString = choicesMatch[1];
                  const choiceMatches = choicesString.match(/{\s*name:\s*"([^"]+)",\s*value:\s*"([^"]+)"\s*}/g);
                  
                  if (choiceMatches) {
                    option.choices = [];
                    for (const choiceMatch of choiceMatches) {
                      const choiceNameMatch = choiceMatch.match(/name:\s*"([^"]+)"/);
                      const choiceValueMatch = choiceMatch.match(/value:\s*"([^"]+)"/);
                      
                      if (choiceNameMatch && choiceValueMatch) {
                        option.choices.push({
                          name: choiceNameMatch[1],
                          value: choiceValueMatch[1]
                        });
                      }
                    }
                  }
                }
                
                options.push(option);
              }
            }
          }
          
          // Créer l'objet de commande slash
          const command = {
            name: commandName,
            description: commandDescription,
            options: options
          };
          
          commands.push(command);
          consoleLog(`Commande slash ajoutée: ${commandName}`, "success");
        } else {
          // Vérifier si c'est une commande contextuelle
          const contextMatch = commandContent.match(/new Command[^(]*\([^"]*"context",\s*"([^"]+)",\s*"([^"]+)"/);
          if (contextMatch && contextMatch.length >= 3) {
            const commandName = contextMatch[1];
            const contextTypeMatch = commandContent.match(/context_type[^:]*:\s*ContextMenuCommandType\.([^,\s]+)/);
            
            if (contextTypeMatch) {
              const contextTypeString = contextTypeMatch[1];
              const contextType = contextTypeString === "User" ? 2 : 3; // User = 2, Message = 3
              
              const command = {
                name: commandName,
                type: contextType
              };
              
              commands.push(command);
              consoleLog(`Commande contextuelle ajoutée: ${commandName}`, "success");
            }
          }
        }
      } catch (parseError) {
        consoleLog(`Erreur lors de l'analyse de ${file}: ${parseError}`, "error");
      }
    } catch (fileError) {
      consoleLog(`Erreur lors de la lecture de ${file}: ${fileError}`, "error");
    }
  }
  
  return commands;
}

// Fonction pour supprimer toutes les commandes puis enregistrer les nouvelles
async function resetAndRegisterCommands() {
  try {
    // Vérifier que le token est disponible
    if (!process.env.TOKEN) {
      throw new Error("TOKEN manquant dans les variables d'environnement");
    }
    
    // Vérifier que l'ID d'application est disponible
    const applicationId = process.env.APPLICATION_ID;
    if (!applicationId) {
      throw new Error("APPLICATION_ID manquant dans les variables d'environnement");
    }
    
    // Configurer le client REST
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    
    // 1. ÉTAPE DE NETTOYAGE
    consoleLog(`PHASE 1: NETTOYAGE DES COMMANDES EXISTANTES`, "warning");
    
    // 1.1 Supprimer les commandes globales
    consoleLog(`1.1 Suppression des commandes globales...`, "info");
    try {
      const globalRoute = Routes.applicationCommands(applicationId);
      await rest.put(globalRoute, { body: [] });
      consoleLog(`✓ Commandes globales supprimées avec succès`, "success");
    } catch (error) {
      consoleLog(`✗ Erreur lors de la suppression des commandes globales: ${error}`, "error");
    }
    
    // 1.2 Supprimer les commandes spécifiques au serveur si GUILD_ID est défini
    const guildId = process.env.GUILD_ID;
    if (guildId) {
      consoleLog(`1.2 Suppression des commandes du serveur ${guildId}...`, "info");
      try {
        const guildRoute = Routes.applicationGuildCommands(applicationId, guildId);
        await rest.put(guildRoute, { body: [] });
        consoleLog(`✓ Commandes du serveur supprimées avec succès`, "success");
      } catch (error) {
        consoleLog(`✗ Erreur lors de la suppression des commandes du serveur: ${error}`, "error");
      }
    }
    
    // 2. ÉTAPE D'EXTRACTION DES COMMANDES
    consoleLog(`\nPHASE 2: EXTRACTION DES COMMANDES`, "warning");
    const commands = await extractCommands();
    
    // 3. ÉTAPE D'ENREGISTREMENT GLOBAL
    consoleLog(`\nPHASE 3: ENREGISTREMENT DES COMMANDES GLOBALEMENT`, "warning");
    consoleLog(`Enregistrement de ${commands.length} commandes globalement...`, "info");
    
    if (commands.length === 0) {
      consoleLog(`Aucune commande à enregistrer.`, "warning");
    } else {
      try {
        const globalRoute = Routes.applicationCommands(applicationId);
        const response = await rest.put(globalRoute, { body: commands });
        
        consoleLog(`✓ ${Array.isArray(response) ? response.length : 0} commandes enregistrées globalement avec succès!`, "success");
        consoleLog(`Les commandes seront disponibles dans tous les serveurs où votre bot est présent.`, "info");
        consoleLog(`Note: Les commandes globales peuvent prendre jusqu'à une heure pour apparaître partout.`, "warning");
      } catch (error) {
        consoleLog(`✗ Erreur lors de l'enregistrement des commandes globales: ${error}`, "error");
      }
    }
    
  } catch (error) {
    consoleLog(`Erreur générale: ${error}`, "error");
    process.exit(1);
  }
}

// Exécuter la fonction principale
console.log("\x1b[33m⚠️  ATTENTION: Ce script va:\x1b[0m");
console.log("\x1b[33m1. Supprimer TOUTES les commandes existantes (globales et serveur)\x1b[0m");
console.log("\x1b[33m2. Enregistrer toutes vos commandes GLOBALEMENT\x1b[0m");
console.log("\x1b[33mÊtes-vous sûr de vouloir continuer? (oui/non)\x1b[0m");

process.stdin.once("data", (data) => {
  const response = data.toString().trim().toLowerCase();
  
  if (response === "oui" || response === "o" || response === "yes" || response === "y") {
    resetAndRegisterCommands();
  } else {
    console.log("\x1b[32mOpération annulée.\x1b[0m");
    process.exit(0);
  }
});