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
  
  const commandFiles = fs.readdirSync(location)
    .filter(file => file.endsWith(".ts") && fs.statSync(path.join(location, file)).isFile());
  
  for (const file of commandFiles) {
    let commandModule;
    try {
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
    client.commands.set(command.name, command);
    
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

            if (option.choices && option.choices.length > 0) {
              if (["String", "Number"].includes(option.type)) {
                try {
                  const choices = option.choices.map(
                    (choice: { name: string; value: any }) => ({ name: choice.name, value: choice.value })
                  );
                  
                  if (typeof opt.addChoices === 'function') {
                    opt.addChoices(...choices);
                  }
                } catch (choiceError: any) {
                  console.error(`Impossible d'ajouter des choix: ${choiceError?.message || 'Erreur inconnue'}`);
                }
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

  // Vérifier si l'enregistrement automatique des commandes est activé
  const config = require("../config").default;
  
  if (config.autoRegisterCommands && client.user && client.token) {
    Console.box("^y", "Commandes", [
      { type: "info", content: `Enregistrement automatique des commandes en cours...` }
    ]);
    
    const rest = new REST({ version: "10" }).setToken(client.token);
    try {
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });
      
      Console.box("^g", "Commandes", [
        { type: "success", content: `${commands.length} commandes enregistrées avec succès!` }
      ]);
    } catch (error) {
      Console.box("^r", "Discord API", [
        { type: "error", content: `Erreur lors de la synchronisation des commandes: ${error}` }
      ]);
    }
  } else if (!config.autoRegisterCommands) {
    Console.box("^y", "Commandes", [
      { type: "info", content: `Enregistrement automatique des commandes désactivé` },
      { type: "info", content: `Utilisez 'npm run register-simple' pour enregistrer les commandes` }
    ]);
  }
};
