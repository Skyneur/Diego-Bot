import dotenv from "dotenv";
dotenv.config();
import { Client, IntentsBitField, Collection } from "discord.js";
import config from "./config";
import { Console } from "./utils/console/namespace";
import { _T } from "./utils/translator";

const bot = new Client({ intents: [3276799] });

bot.login(process.env.TOKEN).then(() => {
  console.clear();
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
