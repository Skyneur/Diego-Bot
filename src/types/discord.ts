import { Collection } from 'discord.js';
import { Command } from '../handlers/commands';

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, any>;
  }
}