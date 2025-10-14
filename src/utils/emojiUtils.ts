import { Emojis } from "@src/constants/emojis";

export const EmojiUtils = {
  getConnectionEmoji: (ping: number) => {
    if (ping === 0 || ping < 50) return Emojis.GOOD_CONNECTION;
    if (ping < 150) return Emojis.MID_CONNECTION;
    if (ping < 300) return Emojis.LOW_CONNECTION;
    return Emojis.OFFLINE;
  },
  
  getStatusEmoji: (status: string) => {
    switch(status) {
      case "online":
        return Emojis.ONLINE_GIF;
      case "idle":
        return Emojis.IDLE_GIF;
      case "dnd":
        return Emojis.DND_GIF;
      default:
        return Emojis.OFFLINE;
    }
  },
  
  getGameEmoji: (gameName: string) => {
    const lowercaseName = gameName.toLowerCase();
    
    if (lowercaseName.includes("league of legends") || lowercaseName.includes("lol")) {
      return Emojis.LOL;
    }
    
    if (lowercaseName.includes("valorant") || lowercaseName.includes("valo")) {
      return Emojis.VALORANT;
    }
    
    return "";
  },
  
  getBooleanEmoji: (value: boolean, style: "simple" | "fancy" = "simple") => {
    if (style === "simple") {
      return value ? Emojis.CHECK : Emojis.CROSS;
    } else {
      return value ? Emojis.CHECK2 : Emojis.CROSS2;
    }
  },
  
  getNewEmoji: (isNew: boolean) => {
    if (!isNew) return "";
    return `${Emojis.NEW}${Emojis.NEW2}`;
  }
};