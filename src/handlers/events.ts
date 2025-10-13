import { _T } from "@src/utils/translator";
import { Client } from "discord.js";
import { Console } from "@src/utils/console/namespace";
import fs from "fs";
import path from "path";

export class Event<TArgs extends unknown[] = unknown[]> {
  type: string;
  execute: (...args: TArgs) => Promise<void>;

  constructor(type: string, execute: (...args: TArgs) => Promise<void>) {
    this.type = type;
    this.execute = execute;
  }
}

let location = "./src/events";
export const handleEvents = async (client: Client) => {
  let loaded_events: (string | number)[][] = [];
  await fs.readdirSync(location).forEach((file) => {
    const fStats = fs.statSync(path.join(location, file));
    if (fStats.isFile() && file.endsWith(".ts")) {
      const eventModule = require(`../events/${file}`).default;
      // Prend en charge les deux formats d'export: direct ou avec {event}
      const event = eventModule.event || eventModule;
      
      if (!event || !(event instanceof Event)) {
        console.error(_T("invalid_event", { file: file }));
        return;
      }
      
      client.on(event.type, (...args) => event.execute(client, ...args));
      loaded_events.push([file, `^g${_T("loaded")}`]);
    }
  });
  Console.table({
    color: "^y",
    title: _T("events"),
    headers: [_T("name"), _T("status")],
    rows: loaded_events,
    comment: _T("found_events", { count: loaded_events.length }),
  });
};
