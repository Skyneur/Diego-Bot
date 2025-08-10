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
  await fs.readdirSync(location).forEach((file) => {
    const fStats = fs.statSync(path.join(location, file));
    if (fStats.isFile() && file.endsWith(".ts")) {
      const command: { command: Command<any> } =
        require(`../commands/${file}`).default;
      if (!command || !(command instanceof Command)) {
        console.error(_T("invalid_command", { file: file }));
        return;
      }
      client.commands.set(command.name, command);
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

              if (option.choices) {
                opt.addChoices(
                  option.choices.map(
                    (choice: { name: string; value: any }) => ({ ...choice })
                  )
                );
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
    loaded_commands.push([file, `^g${_T("loaded")}`]);
  });

  Console.table({
    color: "^b",
    title: _T("commands"),
    headers: [_T("name"), _T("status")],
    rows: loaded_commands,
    comment: _T("found_commands", { count: loaded_commands.length }),
  });

  if (client.user && client.token) {
    const rest = new REST({ version: "10" }).setToken(client.token);
    rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
  }
};
