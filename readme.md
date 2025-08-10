# 🤖 Discord Bot TypeScript

Un bot Discord moderne et modulaire développé en TypeScript avec une architecture propre et extensible.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

## ✨ Fonctionnalités

- 🏗️ **Architecture modulaire** - Système de commandes et d'événements facilement extensible
- 🌐 **Support multilingue** - Système de traduction intégré
- 🎨 **Console stylisée** - Logs colorés et formatés avec des tableaux et encadrés
- ⚡ **Hot reload** - Rechargement automatique pendant le développement
- 🔧 **TypeScript** - Type safety et IntelliSense
- 📦 **Handlers automatiques** - Chargement automatique des commandes et événements
- 🛡️ **Gestion des permissions** - Support complet des permissions Discord
- 🎯 **Commandes Slash** - Support natif des commandes slash et des menus contextuels

## 🚀 Installation

### Prérequis

- [Node.js](https://nodejs.org/) (v16 ou plus récent)
- [pnpm](https://pnpm.io/) (recommandé) ou npm
- Un token de bot Discord

### Configuration

1. **Clonez le repository**

   ```bash
   git clone https://github.com/Soren-git/discord-bot-typescript.git
   cd discord-bot-typescript
   ```

2. **Installez les dépendances**

   ```bash
   pnpm install
   # ou
   npm install
   ```

3. **Configurez l'environnement**

   ```bash
   cp .env.example .env
   ```

   Éditez le fichier `.env` et ajoutez votre token :

   ```env
   TOKEN=votre_token_discord_ici
   ```

4. **Configurez le bot**

   Modifiez `src/config.ts` selon vos besoins :

   ```typescript
   const config: Config = {
     language: "en", // Langue du bot
     prefix: "$", // Préfixe des commandes
     status: "dnd", // Statut du bot
     activities: [
       // Activités du bot
       {
         name: ".gg/zproject",
         type: ActivityType.Custom,
       },
     ],
   };
   ```

## 🎮 Utilisation

### Développement

```bash
pnpm dev
# ou
npm run dev
```

### Production

```bash
# Compilation
pnpm build
# ou
npm run build

# Démarrage
node dist/bot.js
```

## 📁 Structure du projet

```
src/
├── commands/          # Commandes du bot
│   └── ping.ts        # Exemple de commande
├── events/            # Événements Discord
│   └── message-create.ts
├── handlers/          # Gestionnaires de commandes et événements
│   ├── commands.ts
│   └── events.ts
├── locales/           # Fichiers de traduction
│   └── en.json
├── types/             # Définitions TypeScript
├── utils/             # Utilitaires
│   ├── console/       # Système de console stylisée
│   └── translator.ts  # Système de traduction
├── constants/         # Constantes
├── config.ts          # Configuration du bot
└── bot.ts             # Point d'entrée
```

## 🛠️ Ajouter des commandes

### Commande basique (avec préfixe)

Créez un fichier dans `src/commands/` :

```typescript
import { Command } from "@src/handlers/commands";
import { Client, Message } from "discord.js";

const command = new Command<[Client, Message, string[]]>(
  "basic",
  "hello",
  "Say hello to the user",
  null,
  [],
  async (client, message, args) => {
    const user = args[0] ? `<@${args[0]}>` : message.author.toString();
    message.reply(`Hello ${user}! 👋`);
  }
);

export default command;
```

### Commande Slash

```typescript
import { Command } from "@src/handlers/commands";
import { Client, CommandInteraction } from "discord.js";

const command = new Command<[Client, CommandInteraction]>(
  "slash",
  "greet",
  "Greet a user",
  null,
  [
    {
      type: "User",
      name: "user",
      description: "User to greet",
      required: true,
      choices: [],
    },
  ],
  async (client, interaction) => {
    const user = interaction.options.getUser("user");
    await interaction.reply(`Hello ${user}! 👋`);
  }
);

export default command;
```

### Menu contextuel

```typescript
import { Command } from "@src/handlers/commands";
import {
  Client,
  ContextMenuCommandInteraction,
  ContextMenuCommandType,
} from "discord.js";

const command = new Command<[Client, ContextMenuCommandInteraction]>(
  "context",
  "User Info",
  "Get user information",
  null,
  [],
  async (client, interaction) => {
    const user = interaction.targetUser;
    await interaction.reply(`User: ${user.tag}\nID: ${user.id}`);
  },
  ContextMenuCommandType.User
);

export default command;
```

## 📝 Ajouter des événements

Créez un fichier dans `src/events/` :

```typescript
import { Event } from "@src/handlers/events";
import { Client, GuildMember } from "discord.js";

const event = new Event<[Client, GuildMember]>(
  "guildMemberAdd",
  async (client, member) => {
    console.log(`${member.user.tag} joined ${member.guild.name}`);
    // Logique de bienvenue
  }
);

export default event;
```

## 🌐 Système de traduction

### Ajouter une nouvelle langue

1. Créez un fichier JSON dans `src/locales/` (ex: `fr.json`)
2. Ajoutez vos traductions :
   ```json
   {
     "welcome": "Bienvenue {username}!",
     "goodbye": "Au revoir!"
   }
   ```
3. Utilisez dans votre code :

   ```typescript
   import { _T } from "@src/utils/translator";

   const message = _T("welcome", { username: "John" });
   ```

## 🎨 Console stylisée

Le bot inclut un système de console avancé avec couleurs et formatage :

```typescript
import { Console } from "@src/utils/console/namespace";

// Encadré avec icônes
Console.box("^g", "Success", [
  { type: "success", content: "Operation completed!" },
  { type: "info", content: "Details: ^y42^R files processed" },
]);

// Tableau formaté
Console.table({
  color: "^b",
  title: "Statistics",
  headers: ["Name", "Count"],
  rows: [
    ["Users", 150],
    ["Servers", 5],
  ],
  comment: "Updated every hour",
});
```

## 🔧 Configuration avancée

### Permissions

Les commandes supportent les permissions Discord :

```typescript
import { PermissionFlagsBits } from "discord.js";

const command = new Command(
  "slash",
  "admin",
  "Admin command",
  PermissionFlagsBits.Administrator // Seuls les admins peuvent utiliser
  // ...
);
```

### Intents

Le bot utilise les intents suivants (configurés dans `bot.ts`) :

- Guilds
- Guild Messages
- Message Content
- Et autres selon vos besoins

## 📊 Scripts disponibles

| Script             | Description                                   |
| ------------------ | --------------------------------------------- |
| `pnpm dev`         | Démarre en mode développement avec hot reload |
| `pnpm build`       | Compile le TypeScript en JavaScript           |
| `node dist/bot.js` | Démarre le bot compilé                        |

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- 💬 Discord: [Rejoignez notre serveur](https://discord.gg/zproject)
- 🐛 Issues: [GitHub Issues](https://github.com/Soren-git/discord-bot-typescript/issues)

## 🙏 Remerciements

- [Discord.js](https://discord.js.org/) - Bibliothèque Discord pour Node.js
- [TypeScript](https://www.typescriptlang.org/) - JavaScript avec types statiques
- La communauté Discord.js pour l'aide et les ressources

---

⭐ **N'oubliez pas de mettre une étoile si ce projet vous a aidé !**
