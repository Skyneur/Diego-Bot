import { Command } from "@src/handlers/commands";
import { Client, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable, MessageFlags, User } from "discord.js";
import { statsManager, GameType } from "@src/utils/stats/playerStats";
import { getEmoji } from "@src/constants/emojis";
import config from "@src/config";

const command = new Command<[Client, ChatInputCommandInteraction]>(
  "slash",
  "stats",
  "Gérer les statistiques des joueurs",
  null,
  [
    {
      type: "String",
      name: "action",
      description: "Action à effectuer",
      required: true,
      choices: [
        { name: "Afficher mes stats", value: "show" },
        { name: "Ajouter une victoire", value: "win" },
        { name: "Ajouter une défaite", value: "loss" },
        { name: "Voir le classement", value: "leaderboard" },
        { name: "Réinitialiser mes stats", value: "reset" }
      ]
    },
    {
      type: "String",
      name: "jeu",
      description: "Jeu concerné",
      required: true,
      choices: [
        { name: "Valorant", value: "valorant" },
        { name: "League of Legends", value: "lol" }
      ]
    },
    {
      type: "User",
      name: "joueur",
      description: "Joueur (uniquement pour ajouter des stats à un autre joueur)",
      required: false,
      choices: []
    }
  ],
  async (client, interaction) => {
    try {
      const action = interaction.options.getString("action") as string;
      const gameType = interaction.options.getString("jeu") as GameType;
      const targetUser = interaction.options.getUser("joueur") || interaction.user;
      const isAdmin = interaction.memberPermissions?.has("Administrator") || false;
      const isSelf = targetUser.id === interaction.user.id;

      if (!isSelf && !isAdmin && (action === "win" || action === "loss" || action === "reset")) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("❌ Accès refusé")
              .setDescription("### Permission insuffisante\n*Vous ne pouvez pas modifier les statistiques d'autres joueurs.*")
              .setColor("Red")
              .addFields({
                name: "🔒 Restriction",
                 value: "Seuls les administrateurs peuvent modifier les statistiques des autres joueurs.",
                inline: false
              })
              .addFields({
                name: "💡 Alternative",
                value: "Vous pouvez uniquement modifier vos propres statistiques.",
                inline: false
              })
              .setFooter({ text: "Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur" })
              .setTimestamp()
          ],
          flags: MessageFlags.Ephemeral
        });
        return;
      }
      
      const gameNames = {
        valorant: "Valorant",
        lol: "League of Legends"
      };
      
      const gameName = gameNames[gameType];
      
      switch (action) {
        case "show": {
          const playerStats = statsManager.getPlayerStats(targetUser.id);
          
          if (!playerStats || (playerStats.games[gameType].wins === 0 && playerStats.games[gameType].losses === 0)) {
            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`${getEmoji('CHART')} Statistiques non disponibles`)
                  .setDescription(`### Aucune donnée trouvée\n*${targetUser.toString()} n'a pas encore de statistiques sur ${gameName}.*`)
                  .setColor(config.color as ColorResolvable)
                  .addFields({
                    name: `${getEmoji('GAME')} Comment commencer ?`,
                    value: `Pour ajouter des statistiques, utilisez les commandes suivantes :\n• \/stats action:Ajouter une victoire jeu:${gameType}\n• \/stats action:Ajouter une défaite jeu:${gameType}`,
                    inline: false
                  })
                  .setFooter({ text: "Les statistiques apparaîtront ici dès que des parties seront enregistrées" })
                  .setTimestamp()
              ]
            });
            return;
          }
          
          const stats = playerStats.games[gameType];
          const totalGames = stats.wins + stats.losses;
          const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
          
          const statsEmbed = new EmbedBuilder()
            .setTitle(`${getEmoji("NOTEPAD")} Statistiques ${gameName}`)
            .setDescription(`### Profil de ${targetUser.toString()}\n*Voici les statistiques pour ce joueur sur ${gameName}*`)
            .setColor(config.color as ColorResolvable)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
              { name: `${getEmoji("ROCKET")} Victoires`, value: `**${stats.wins}**`, inline: true },
              { name: `${getEmoji("CROSS")} Défaites`, value: `**${stats.losses}**`, inline: true },
              { name: `${getEmoji("GLOBE")} Ratio V/D`, value: `**${winRate}%**`, inline: true },
              { name: `${getEmoji("GEAR")} Score ELO`, value: `**${stats.skillRating}**`, inline: true },
              { name: `${getEmoji("ROCKET")} Parties jouées`, value: `**${totalGames}**`, inline: true }
            )
            .setFooter({ text: `Joueur ID: ${targetUser.id} • Statistiques à jour` })
            .setTimestamp();
          
          await interaction.reply({ embeds: [statsEmbed] });
          break;
        }
        
        case "win": {
          statsManager.addWin(targetUser.id, targetUser.tag, gameType);
          
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`${getEmoji('CHECK2')} Victoire enregistrée`)
                .setDescription(`### Félicitations ${targetUser.toString()} !\n*Une victoire a été ajoutée à votre palmarès sur ${gameName}.*`)
                .setColor("Green")
                .setTimestamp()
                .addFields(
                  { name: "`💯` Nouveau score", value: `**${statsManager.getPlayerStats(targetUser.id)?.games[gameType].skillRating || "N/A"}** (+25 points)`, inline: true },
                  { name: "`📈` Total des victoires", value: `**${statsManager.getPlayerStats(targetUser.id)?.games[gameType].wins || "N/A"}**`, inline: true }
                )
                .setFooter({ text: "Utilisez /stats action:Afficher mes stats pour voir vos statistiques complètes" })
            ]
          });
          break;
        }
        
        case "loss": {
          statsManager.addLoss(targetUser.id, targetUser.tag, gameType);
          
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`${getEmoji('NOTEPAD')} Défaite enregistrée`)
                .setDescription(`### Pas de chance ${targetUser.toString()} !\n*Une défaite a été ajoutée à votre historique sur ${gameName}.*`)
                .setColor("Red")
                .setTimestamp()
                .addFields(
                  { name: "`💯` Nouveau score", value: `**${statsManager.getPlayerStats(targetUser.id)?.games[gameType].skillRating || "N/A"}** (-20 points)`, inline: true },
                  { name: "`📉` Total des défaites", value: `**${statsManager.getPlayerStats(targetUser.id)?.games[gameType].losses || "N/A"}**`, inline: true }
                )
                .setFooter({ text: "La prochaine fois sera la bonne ! Continuez vos efforts." })
            ]
          });
          break;
        }
        
        case "leaderboard": {
          const leaderboard = statsManager.getLeaderboard(gameType);
          
          if (leaderboard.length === 0) {
            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`\`🏆\` Classement ${gameName}`)
                  .setDescription("### Aucun joueur dans le classement\n*Soyez le premier à ajouter des statistiques avec `/stats action:Ajouter une victoire`*")
                  .setColor(config.color as ColorResolvable)
                  .setTimestamp()
                  .setFooter({ text: "Les statistiques apparaîtront ici dès que des parties seront enregistrées" })
              ]
            });
            return;
          }
          
          const leaderboardEmbed = new EmbedBuilder()
            .setTitle(`\`🏆\` Classement ${gameName}`)
            .setDescription(`### Top ${leaderboard.length} des joueurs\n*Voici les meilleurs joueurs actuels sur ${gameName}*`)
            .setColor(config.color as ColorResolvable)
            .setTimestamp();

          let topPlayersDesc = "";

          for (let i = 0; i < Math.min(3, leaderboard.length); i++) {
            const player = leaderboard[i];
            const stats = player.games[gameType];
            const totalGames = stats.wins + stats.losses;
            const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
            
            const medals = ["🥇", "🥈", "🥉"];
            
            topPlayersDesc += `${medals[i]} **${player.displayName}** - ${stats.skillRating} pts (WR: ${winRate}%)\n`;
          }
          
          if (topPlayersDesc) {
            leaderboardEmbed.addFields({
              name: "🔱 Podium",
              value: topPlayersDesc,
              inline: false
            });
          }

          leaderboard.forEach((player, index) => {
            const stats = player.games[gameType];
            const totalGames = stats.wins + stats.losses;
            const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

            let ratingEmoji = "⚪";
            if (winRate >= 55) ratingEmoji = "🟢";
            else if (winRate >=35) ratingEmoji = "🟠";
            else ratingEmoji = "🔴";
            
            leaderboardEmbed.addFields({
              name: `#${index + 1} ${player.displayName}`,
              value: `${ratingEmoji} ELO: **${stats.skillRating}** | V/D: **${stats.wins}**/**${stats.losses}** | Winrate: **${winRate}%**`,
              inline: false
            });
          });
          
          await interaction.reply({ embeds: [leaderboardEmbed] });
          break;
        }
        
        case "reset": {
          statsManager.resetPlayerStats(targetUser.id, gameType);
          
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("🗑️ Statistiques réinitialisées")
                .setDescription(`### Nouveau départ pour ${targetUser.toString()}\n*Toutes les statistiques de ce joueur pour ${gameName} ont été réinitialisées.*`)
                .setColor("Orange")
                .addFields(
                  { name: "💫 Score réinitialisé", value: "**1000**", inline: true },
                  { name: "🧹 Données effacées", value: "Victoires et défaites", inline: true }
                )
                .setFooter({ text: "Cette action ne peut pas être annulée" })
                .setTimestamp()
            ],
            flags: MessageFlags.Ephemeral
          });
          break;
        }
      }
    } catch (error) {
      console.error("Erreur dans la commande stats:", error);
      
      if (interaction.isRepliable() && !interaction.replied) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${getEmoji('CROSS2')} Erreur`)
              .setDescription("### Une erreur est survenue\n*Le système a rencontré un problème lors de l'exécution de cette commande.*")
              .setColor("Red")
              .addFields({ 
                name: "📋 Détails techniques", 
                value: `\`\`\`${error}\`\`\``,
                inline: false 
              })
              .addFields({
                name: "🔄 Solution",
                value: "Veuillez réessayer dans quelques instants ou contacter un administrateur si le problème persiste.",
                inline: false
              })
              .setFooter({ text: "Cette erreur a été enregistrée pour analyse" })
              .setTimestamp()
          ],
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
);

export default command;