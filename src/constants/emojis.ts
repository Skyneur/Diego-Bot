import { _T } from "@src/utils/translator";

export interface Emoji {
  id: string;
  name: string;
  animated: boolean;
  toString(): string;
}

class CustomEmoji implements Emoji {
  id: string;
  name: string;
  animated: boolean;
  
  constructor(id: string, name: string, animated: boolean = false) {
    this.id = id;
    this.name = name;
    this.animated = animated;
  }

  toString(): string {
    return this.animated 
      ? `<a:${this.name}:${this.id}>`
      : `<:${this.name}:${this.id}>`;
  }
}

export const Emojis = {
  TROLL_CAT: new CustomEmoji("1427556965449728081", "trollcat", true),
  
  // Icônes de connexion
  GOOD_CONNECTION: new CustomEmoji("1427574798351077457", "goodconnection", false),
  MID_CONNECTION: new CustomEmoji("1427574784484573284", "midconnection", false),
  LOW_CONNECTION: new CustomEmoji("1427574768756068382", "lowconnection", false),
  
  // Statuts de présence
  OFFLINE: new CustomEmoji("1427574735633518592", "offline", false),
  ONLINE: new CustomEmoji("1427574705954623559", "online", false),
  ONLINE_GIF: new CustomEmoji("1427574682034503782", "onlinegif", true),
  IDLE: new CustomEmoji("1427574654876520478", "idle", false),
  IDLE_GIF: new CustomEmoji("1427574628884156466", "idlegif", true),
  DND: new CustomEmoji("1427574568255492116", "dng", false),
  DND_GIF: new CustomEmoji("1427574319059304518", "dnggif", true),
  
  // Jeux
  LOL: new CustomEmoji("1427573173829767229", "lol", false),
  VALORANT: new CustomEmoji("1427573160248606778", "valo", false),
  
  // Indicateurs
  CROW: new CustomEmoji("1427573149217853521", "crow", false),
  CROSS2: new CustomEmoji("1427573124865462312", "cross2", false),
  CHECK2: new CustomEmoji("1427573111603069020", "check2", false),
  CROSS: new CustomEmoji("1427573095610323005", "cross", false),
  CHECK: new CustomEmoji("1427573083216285767", "check", false),
  NEW: new CustomEmoji("1427573046499082312", "new", false),
  NEW2: new CustomEmoji("1427573066145202267", "new2", false),
  
  // Emojis Unicode standards
  ROCKET: "🚀",
  GEAR: "⚙️",
  GLOBE: "🌐",
  CLOCK: "🕰️",
  NOTEPAD: "📋",
  WRENCH: "🔧",
  FOLDER: "📂"
};

export function getEmoji(name: keyof typeof Emojis, fallback: string = ""): string {
  const emoji = Emojis[name];
  if (!emoji) return fallback;
  
  if (typeof emoji === "string") {
    return emoji;
  }
  
  return emoji.toString();
}