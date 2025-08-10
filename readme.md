# 🤖 Discord Bot TypeScript Template

Un template moderne et modulaire pour développer des bots Discord en TypeScript avec une architecture propre et extensible.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

## ✨ Fonctionnalités

- 🏗️ **Architecture modulaire** - Template avec système de commandes et d'événements facilement extensible
- 🌐 **Support multilingue** - Système de traduction intégré et configurable
- 🎨 **Console stylisée** - Système de logs colorés et formatés avec tableaux et encadrés
- ⚡ **Hot reload** - Configuration prête pour le développement avec rechargement automatique
- 🔧 **TypeScript** - Template entièrement typé avec IntelliSense complet
- 📦 **Handlers automatiques** - Système de chargement automatique des commandes et événements
- 🛡️ **Gestion des permissions** - Support complet et prêt à l'emploi des permissions Discord
- 🎯 **Multi-types de commandes** - Support natif des commandes préfixées, slash et menus contextuels
- 🚀 **Prêt à l'emploi** - Configuration minimale requise pour démarrer votre projet

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
     language: "en",        // Langue du bot
     prefix: "$",           // Préfixe des commandes
     status: "dnd",         // Statut du bot
     activities: [          // Activités du bot
       {
         name: ".gg/zproject",
         type: ActivityType.Custom,
       },
     ],
   };
   ```

## 🎮 Développement

### Mode développement

```bash
pnpm dev
# ou
npm run dev
```

### Build et production

```bash
# Compilation TypeScript
pnpm build
# ou
npm run build

# Démarrage en production
node dist/bot.js
```

### Structure de développement

Le template est conçu pour être facilement extensible. Ajoutez simplement vos fichiers dans les dossiers appropriés et ils seront automatiquement chargés !

## 📁 Structure du projet

```
src/
├── commands/           # Commandes du bot
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
└── bot.ts            # Point d'entrée
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
      choices: []
    }
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
import { Client, ContextMenuCommandInteraction, ContextMenuCommandType } from "discord.js";

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

## 📝 Créer vos propres événements

Créez un fichier dans `src/events/` :

```typescript
import { Event } from "@src/handlers/events";
import { Client, GuildMember } from "discord.js";

const event = new Event<[Client, GuildMember]>(
  "guildMemberAdd",
  async (client, member) => {
    console.log(`${member.user.tag} joined ${member.guild.name}`);
    // Votre logique de bienvenue ici
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
  { type: "info", content: "Details: ^y42^R files processed" }
]);

// Tableau formaté
Console.table({
  color: "^b",
  title: "Statistics",
  headers: ["Name", "Count"],
  rows: [["Users", 150], ["Servers", 5]],
  comment: "Updated every hour"
});
```

### Codes de couleur disponibles

- `^r` Rouge, `^g` Vert, `^b` Bleu, `^y` Jaune
- `^c` Cyan, `^m` Magenta, `^w` Blanc, `^0` Noir
- `^B` Gras, `^U` Souligné, `^R` Reset

## 🔧 Configuration avancée

### Permissions

Les commandes supportent les permissions Discord :

```typescript
import { PermissionFlagsBits } from "discord.js";

const command = new Command(
  "slash",
  "admin",
  "Admin command",
  PermissionFlagsBits.Administrator, // Seuls les admins peuvent utiliser
  // ...
);
```

### Intents

Le bot utilise les intents suivants (configurés dans `bot.ts`) :
- Guilds
- Guild Messages
- Message Content
- Et autres selon vos besoins

## 📊 Scripts et commandes

| Script | Description |
|--------|-------------|
| `pnpm dev` / `npm run dev` | Démarre en mode développement avec hot reload |
| `pnpm build` / `npm run build` | Compile le TypeScript vers JavaScript |
| `node dist/bot.js` | Démarre le bot compilé en production |

## 🚀 Déploiement

### Préparation pour la production

1. Compilez le projet : `pnpm build`
2. Configurez vos variables d'environnement
3. Utilisez `node dist/bot.js` pour démarrer
4. Considérez un process manager comme PM2

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- 💬 Discord: [Rejoignez notre serveur](https://discord.gg/zproject)
- 🐛 Issues: [GitHub Issues](https://github.com/Soren-git/discord-bot-typescript/issues)

## 🙏 Remerciements et crédits

Un grand merci à tous ceux qui rendent ce template possible :

- **[Discord.js](https://discord.js.org/)** - La meilleure bibliothèque Discord pour Node.js
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript avec types statiques
- **La communauté Discord.js** - Pour l'aide, les ressources et l'inspiration
- **Tous les contributeurs** - Chaque contribution compte !

### Technologies utilisées

Ce template utilise uniquement des dépendances modernes et maintenues :
- Discord.js v14 pour l'interaction avec l'API Discord
- TypeScript pour la sécurité des types
- ts-node-dev pour le développement avec hot reload
- dotenv pour la gestion des variables d'environnement

---

## 🌟 Soutenez le projet

Si ce template vous a aidé à créer votre bot Discord, n'hésitez pas à :

⭐ **Mettre une étoile au projet**  
🔄 **Partager avec d'autres développeurs**  
💝 **Contribuer au développement**  

---

**Créé avec ❤️ par [Soren](https://github.com/Soren-git) | Template Discord Bot TypeScript**