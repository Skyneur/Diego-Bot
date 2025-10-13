import dotenv from "dotenv";
dotenv.config();
const events = require("discord-events.js");
import { handleEvents } from "./handlers/events";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { _T } from "./utils/translator";
import config from "@src/config";
import { Console } from "@src/utils/console/namespace";
import { handleCommands } from "./handlers/commands";

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, any>;
  }
}

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
bot.commands = new Collection();

bot.login(process.env.TOKEN).then(async () => {
  handleEvents(bot);
  handleCommands(bot);
  bot.user?.setPresence({
    activities: config.activities,
    status: config.status,
  });
  const intentsBitfield = bot.options.intents.bitfield;
  const intentsCount = intentsBitfield.toString(2).replace(/0/g, "").length;

  Console.box("^g", _T("login"), [
    {
      type: "success",
      content: _T("login_success", { tag: bot.user?.tag }),
    },
    {
      type: "default",
      content: _T("date", { date: new Date().toLocaleString() }),
    },
    {
      type: "default",
      content: _T("intents_count", { count: intentsCount }),
    },
  ]);
});
