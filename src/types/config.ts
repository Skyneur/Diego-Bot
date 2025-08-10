import { ActivityType, PresenceStatusData } from "discord.js";

export interface Config {
  language: string;
  prefix: string;
  status: PresenceStatusData;
  activities: { name: string; type: ActivityType }[];
}
