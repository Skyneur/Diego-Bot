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

async function registerCommands() {
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
    
    // Récupérer la liste des fichiers de commandes
    const commandsDir = path.join(process.cwd(), "src", "commands");
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith(".ts"));
    
    consoleLog(`Recherche des commandes...`, "info");
    consoleLog(`${commandFiles.length} fichiers de commandes trouvés`, "info");
    
    // Tableau pour stocker les commandes à enregistrer
    const commands = [];
    
    // Analyser chaque fichier de commande
    for (const file of commandFiles) {
      const commandPath = path.join(commandsDir, file);
      const commandContent = fs.readFileSync(commandPath, 'utf8');
      
      // Extraction des informations de la commande à partir du contenu du fichier
      // Cette approche évite les problèmes de compilation TypeScript
      try {
        // Extraire le nom et la description
        const nameMatch = commandContent.match(/new Command[^(]*\([^"]*"slash",\s*"([^"]+)",\s*"([^"]+)"/);
        
        if (nameMatch && nameMatch.length >= 3) {
          const commandName = nameMatch[1];
          const commandDescription = nameMatch[2];
          
          // Extraire les options si présentes
          const options = [];
          const optionsRegex = /options:\s*\[\s*{([^}]+)}\s*\]/gs;
          const optionsMatch = commandContent.match(optionsRegex);
          
          if (optionsMatch) {
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
    }
    
    // Configurer le client REST
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    
    consoleLog(`Début de l'enregistrement de ${commands.length} commandes...`, "info");
    
    // Déterminer si on enregistre globalement ou pour un serveur spécifique
    const guildId = process.env.GUILD_ID;
    const route = guildId 
      ? Routes.applicationGuildCommands(applicationId, guildId) 
      : Routes.applicationCommands(applicationId);
    
    // Envoyer les commandes à l'API Discord
    const response = await rest.put(route, { body: commands });
    
    // Afficher un message de succès
    consoleLog(`${Array.isArray(response) ? response.length : 0} commandes enregistrées avec succès!`, "success");
    consoleLog(`Les commandes seront disponibles ${guildId ? "sur ce serveur" : "globalement"} dans quelques minutes`, "info");
  } catch (error) {
    // Afficher l'erreur
    consoleLog(`Erreur lors de l'enregistrement des commandes: ${error}`, "error");
  }
}

// Exécution
registerCommands();