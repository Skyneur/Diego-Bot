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
<!-- README adapté pour Diego-Bot -->
# 🚀 Diego-Bot

Diego-Bot est un bot Discord écrit en TypeScript. Il fournit des commandes utilitaires, un système de statistiques joueur (persisté dans `src/data/playerStats.json`) et expose une API HTTP intégrée pour permettre à un site externe de lire ces statistiques.

Ce projet est basé sur une template initiale fournie par [Soren](https://github.com/Soren-git) — un grand merci pour la base solide.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

## ✨ Points clés du projet

- Architecture modulaire (commands / events / handlers)
- Système de stats joueur (lecture/écriture dans `src/data/playerStats.json` via `statsManager`)
- API HTTP intégrée (exposée par le bot quand il démarre)
- Multilingue (fichiers `src/locales`)
- Hot-reload en développement via `ts-node-dev`

## Installation rapide

Prérequis : Node.js (v16+), npm ou pnpm, et un token Discord.

1. Installer les dépendances :

```bash
npm install
# ou
pnpm install
```

2. Copier et remplir le fichier d'environnement :

```bash
cp .env.example .env
# ajouter TOKEN=... dans .env
```

## Scripts utiles

| Script | Description |
|---|---|
| `npm run dev` | Démarrage en développement (hot reload) |
| `npm run api` | (optionnel) démarre seulement l'API (si tu veux la lancer séparément) |
| `npm run build` | Compile le projet |
| `node dist/bot.js` | Démarrer la version compilée |

> Remarque : l'API est désormais démarrée automatiquement lorsque le bot démarre (`startApi()` est appelé depuis `src/bot.ts`).

## API intégrée

L'API est exposée par défaut sur le port 3000 (modifiable via la variable d'environnement `PORT`). Endpoints principaux :

- GET /api/player-stats — renvoie toutes les statistiques (map id -> objet player)
- GET /api/player-stats/:id — renvoie les stats d'un joueur

Exemples :

```bash
curl http://localhost:3000/api/player-stats
curl http://localhost:3000/api/player-stats/1126528170770837594
```

Notes importantes :
- Le bot utilise `statsManager` en mémoire et persiste sur disque (`src/data/playerStats.json`). Si le bot et l'API sont lancés dans le même process (configuration par défaut), les mises à jour effectuées par le bot sont immédiatement visibles via l'API.
- Si tu veux lancer le bot et l'API dans des processus séparés, considère une approche de synchronisation (DB, webhook ou reload du fichier) pour éviter les incohérences.

## Configuration

- `TOKEN` dans `.env` : token du bot Discord
- `PORT` (optionnel) : port pour l'API HTTP (défaut 3000)

Possibilité supplémentaire : `config.ts` contient d'autres options (startup message, channel de logs, activités, etc.).

## Développement

Démarrer en dev (bot + API) :

```bash
npm run dev
```

Compiler :

```bash
npm run build
```

### Tests rapides

Après démarrage en dev, tester que l'API renvoie les stats :

```bash
curl http://localhost:3000/api/player-stats
```

## Sécurité & production

- Pour la production, pense à protéger l'API (token, IP whitelist, reverse proxy) si elle contient des données sensibles.
- Si tu as besoin de haute disponibilité ou de multiples instances du bot, migre les stats vers une base de données (SQLite / Postgres / MongoDB) plutôt que d'utiliser un fichier JSON partagé.

## Crédits

- Basé sur une template initiale par [Soren](https://github.com/Soren-git)
- Adapté et développé par [Skyneur](https://github.com/Skyneur)

## Licence

Ce projet est sous licence MIT — voir `LICENSE`.

---

Si tu veux que j'ajoute une section détaillée pour le déploiement (PM2 / Docker / CI), ou que j'ajoute un badge CI / couverture, dis-moi ce que tu veux et je l'ajoute.
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

**Créé avec ❤️ par [Skyneur](https://github.com/Skyneur) | Discord Bot TypeScript**