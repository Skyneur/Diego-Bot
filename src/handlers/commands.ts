import {
  Client,
  ContextMenuCommandBuilder,
  ContextMenuCommandType,
  Permissions,
  SlashCommandBuilder,
  Routes,
} from "discord.js";
import { REST } from "@discordjs/rest";
import type { OptionType } from "@src/types/optionType";
import fs from "fs";
import path from "path";
import { _T } from "@src/utils/translator";
import { Console } from "@src/utils/console/namespace";

export class Command<TArgs extends unknown[] = unknown[]> {
  type: "basic" | "slash" | "context";
  name: string;
  context_type?: ContextMenuCommandType;
  description: string;
  permission: Permissions | bigint | number | null | undefined;
  options: OptionType[];
  execute: (...args: TArgs) => Promise<void>;

  constructor(
    type: "basic" | "slash" | "context",
    name: string,
    description: string,
    permission: Permissions | bigint | number | null | undefined,
    options: OptionType[],
    execute: (...args: TArgs) => Promise<void>,
    context_type?: ContextMenuCommandType
  ) {
    this.type = type;
    this.name = name;
    this.description = description;
    this.permission = permission;
    this.options = options;
    this.execute = execute;
    this.context_type = context_type;
  }
}

let location = "./src/commands";
export const handleCommands = async (client: Client) => {
  let loaded_commands: (string | number)[][] = [];
  let commands: Array<ContextMenuCommandBuilder | SlashCommandBuilder> = [];
  
  // Obtenir la liste des fichiers de commande
  const commandFiles = fs.readdirSync(location)
    .filter(file => file.endsWith(".ts") && fs.statSync(path.join(location, file)).isFile());
  
  // Parcourir chaque fichier de commande
  for (const file of commandFiles) {
    // Essayons de charger la commande avec gestion d'erreur
    let commandModule;
    try {
      // Effacer le cache pour éviter les doublons
      delete require.cache[require.resolve(`../commands/${file}`)];
      commandModule = require(`../commands/${file}`).default;
    } catch (error: any) {
      console.error(`Erreur lors du chargement du fichier ${file}:`, error);
      continue;
    }
    
    if (!commandModule || !(commandModule instanceof Command)) {
      console.error(_T("invalid_command", { file: file }));
      continue;
    }
    
    const command = commandModule;
    // Enregistrer la commande dans la collection
    client.commands.set(command.name, command);
    
    // Ajouter à la liste des commandes chargées sans logs détaillés
    loaded_commands.push([file, `^gChargé`]);
      
    if (command.type == "slash") {
      let slashCommand = new SlashCommandBuilder()
        .setName(command.name)
        .setDescription(command.description)
        .setDefaultMemberPermissions(command.permission);

      for (let option of command.options) {
        const method = `add${option.type}Option` as keyof SlashCommandBuilder;

        if (method in slashCommand) {
          (slashCommand[method] as Function)((opt: any) => {
            opt
              .setName(option.name)
              .setDescription(option.description)
              .setRequired(option.required);

            // Les choix sont disponibles uniquement pour les options String et Number
            if (option.choices && option.choices.length > 0) {
              if (["String", "Number"].includes(option.type)) {
                try {
                  const choices = option.choices.map(
                    (choice: { name: string; value: any }) => ({ name: choice.name, value: choice.value })
                  );
                  
                  // Dans discord.js v14, addChoices s'attend à recevoir plusieurs objets, pas un tableau
                  if (typeof opt.addChoices === 'function') {
                    opt.addChoices(...choices);
                  }
                } catch (choiceError: any) {
                  console.error(`Impossible d'ajouter des choix: ${choiceError?.message || 'Erreur inconnue'}`);
                }
              } else {
                // Les types User, Channel, Role ne supportent pas les choix, mais nous ne déclenchons pas d'erreur
              }
            }
            return opt;
          });
        }
      }
      commands.push(slashCommand);
    } else if (command.type == "context" && command.context_type) {
      let contextCommand = new ContextMenuCommandBuilder()
        .setName(command.name)
        .setType(command.context_type)
        .setDefaultMemberPermissions(command.permission);
      commands.push(contextCommand);
    }
  }

  Console.table({
    color: "^b",
    title: _T("commands"),
    headers: [_T("name"), _T("status")],
    rows: loaded_commands,
    comment: _T("found_commands", { count: loaded_commands.length }),
  });

  if (client.user && client.token) {
    const rest = new REST({ version: "10" }).setToken(client.token);
    try {
      // Synchronisation silencieuse des commandes avec Discord
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });
      
      // Log uniquement en cas d'erreur
    } catch (error) {
      Console.box("^r", "Discord API", [
        { type: "error", content: `Erreur lors de la synchronisation des commandes: ${error}` }
      ]);
    }
  }
};
