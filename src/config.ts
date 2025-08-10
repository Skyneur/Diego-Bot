import { ActivityType } from "discord.js";
import type { Config } from "@mytypes/config";

const config: Config = {
  language: "en",
  prefix: "$",
  status: "dnd",
  activities: [
    {
      name: ".gg/zproject",
      type: ActivityType.Custom,
    },
  ],
};

export default config;
