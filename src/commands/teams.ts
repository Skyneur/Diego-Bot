import { Command } from "@src/handlers/commands";
import { Client, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable, MessageFlags } from "discord.js";
import config from "@src/config";
import { getEmoji } from "@src/constants/emojis";
import { statsManager, GameType } from "@src/utils/stats/playerStats";

const command = new Command<[Client, ChatInputCommandInteraction]>(
  "slash",
  "teams",
  "Créer des équipes équilibrées à partir d'une liste de membres",
  null,
  [
    {
      type: "Number",
      name: "nombre",
      description: "Nombre d'équipes à créer",
      required: true,
      choices: []
    },
    {
      type: "String",
      name: "membres",
      description: "Liste des membres (IDs Discord séparés par des espaces, virgules ou retours à la ligne)",
      required: true,
      choices: []
    },
    {
      type: "String",
      name: "jeu",
      description: "Jeu pour lequel équilibrer les équipes",
      required: true,
      choices: [
        { name: "Valorant", value: "valorant" },
        { name: "League of Legends", value: "lol" }
      ]
    },
    {
      type: "String",
      name: "mode",
      description: "Mode de formation des équipes",
      required: false,
      choices: [
        { name: "Équilibré (par statistiques)", value: "balanced" },
        { name: "Aléatoire", value: "random" }
      ]
    }
  ],
  async (client, interaction) => {
    const nombreOption = interaction.options.get("nombre");
    const teamCount = Math.max(2, Math.min(25, nombreOption ? Number(nombreOption.value) : 2));
    const membersInput = interaction.options.getString("membres") || "";
    const gameType = interaction.options.getString("jeu") as GameType || "valorant";
    const mode = interaction.options.getString("mode") || "balanced";
    
    const membersList = membersInput
      .split(/[\n,\s]+/)
      .map(member => member.trim())
      .filter(member => member.length > 0);
      
    interface TeamMember {
      id: string;
      name: string;
      skillRating: number;
    }
    if (membersList.length < 2) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${getEmoji('CROSS')} **Erreur**`)
        .setDescription("Vous devez spécifier au moins 2 membres pour former des équipes.")
        .setColor("Red")
        .setTimestamp();
        
      await interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    

    if (teamCount < 2 || teamCount > membersList.length) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${getEmoji('CROSS')} **Erreur**`)
        .setDescription(`Le nombre d'équipes doit être compris entre 2 et ${membersList.length}.`)
        .setColor("Red")
        .setTimestamp();
        
      await interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    

    let members: TeamMember[] = [];
    
    for (const memberId of membersList) {
      try {
        let displayName = memberId;
        let skillRating = 0;
        if (/^\d{17,19}$/.test(memberId)) {
          try {
            const user = await client.users.fetch(memberId);
            if (user) {
              displayName = user.username;
              

              const playerStats = statsManager.getPlayerStats(memberId);
              if (playerStats) {
                skillRating = playerStats.games[gameType].skillRating;
              } else {

                statsManager.upsertPlayer(memberId, displayName);
              }
            }
          } catch (error) {

          }
        }
        
        members.push({
          id: memberId,
          name: displayName,
          skillRating: skillRating
        });
      } catch (error) {
        console.error(`Erreur lors de la récupération des stats pour ${memberId}:`, error);

        members.push({
          id: memberId,
          name: memberId,
          skillRating: 0
        });
      }
    }
    
    const teams: TeamMember[][] = Array(teamCount).fill(null).map(() => []);
    
    if (mode === "random") {
      for (let i = members.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [members[i], members[j]] = [members[j], members[i]];
      }
      

      const membersPerTeam = Math.floor(members.length / teamCount);
      const extraMembers = members.length % teamCount;
      
      let memberIndex = 0;
      
      for (let i = 0; i < teamCount; i++) {
        const teamSize = i < extraMembers ? membersPerTeam + 1 : membersPerTeam;
        
        for (let j = 0; j < teamSize; j++) {
          if (memberIndex < members.length) {
            teams[i].push(members[memberIndex]);
            memberIndex++;
          }
        }
      }
    } else {
      members.sort((a, b) => b.skillRating - a.skillRating);
      
      const teamSkillSum = Array(teamCount).fill(0);
      
      for (let i = 0; i < members.length; i++) {
        let lowestTeamIndex = 0;
        for (let t = 1; t < teamCount; t++) {
          if (teamSkillSum[t] < teamSkillSum[lowestTeamIndex]) {
            lowestTeamIndex = t;
          }
        }
        
        teams[lowestTeamIndex].push(members[i]);
        teamSkillSum[lowestTeamIndex] += members[i].skillRating;
      }
    }
    
    const teamStats = teams.map(team => {
      const totalSkill = team.reduce((sum, member) => sum + member.skillRating, 0);
      const avgSkill = team.length > 0 ? Math.round(totalSkill / team.length) : 0;
      return { total: totalSkill, average: avgSkill };
    });
    
    const gameNames = {
      valorant: "Valorant",
      lol: "League of Legends"
    };
    const teamsEmbed = new EmbedBuilder()
      .setTitle(`\`🏆\` **Équipes ${gameNames[gameType]}**`)
      .setDescription(`*${members.length} membres répartis en ${teamCount} équipes - Mode: ${mode === "balanced" ? "Équilibré" : "Aléatoire"}*`)
      .setColor(config.color as ColorResolvable)
      .setTimestamp();
    
    teams.forEach((team, index) => {
      let teamDescription = "";
      
      if (team.length > 0) {
        teamDescription = team.map(member => {
          return `• ${member.name} (Score: ${member.skillRating})`;
        }).join('\n');
        
        teamDescription += `\n\n**Score moyen:** ${teamStats[index].average}`;
      } else {
        teamDescription = "Équipe vide";
      }
      
      teamsEmbed.addFields({
        name: `\`👥\` **Équipe ${index + 1}** (${team.length} membres)`,
        value: teamDescription,
        inline: false
      });
    });
    
    await interaction.reply({
      embeds: [teamsEmbed]
    });
  }
);

export default command;