import { Command } from "@src/handlers/commands";
import { Client, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable, MessageFlags } from "discord.js";
import config from "@src/config";

const command = new Command<[Client, ChatInputCommandInteraction]>(
  "slash",
  "teams",
  "Créer des équipes aléatoires à partir d'une liste de membres",
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
      description: "Liste des membres séparés par des espaces, virgules ou retours à la ligne",
      required: true,
      choices: []
    }
  ],
  async (client, interaction) => {
    // Récupérer les options
    const nombreOption = interaction.options.get("nombre");
    const teamCount = Math.max(2, Math.min(25, nombreOption ? Number(nombreOption.value) : 2));
    const membersInput = interaction.options.getString("membres") || "";
    
    // Traiter la liste des membres
    const membersList = membersInput
      .split(/[\n,\s]+/) // Séparer par retour à la ligne, virgule ou espace
      .map(member => member.trim())
      .filter(member => member.length > 0);
    
    // Vérifier qu'il y a suffisamment de membres
    if (membersList.length < 2) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("`❌` **Erreur**")
        .setDescription("Vous devez spécifier au moins 2 membres pour former des équipes.")
        .setColor("Red")
        .setTimestamp();
        
      await interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    
    // Vérifier que le nombre d'équipes est valide
    if (teamCount < 2 || teamCount > membersList.length) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("`❌` **Erreur**")
        .setDescription(`Le nombre d'équipes doit être compris entre 2 et ${membersList.length}.`)
        .setColor("Red")
        .setTimestamp();
        
      await interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    
    // Mélanger la liste des membres
    const shuffledMembers = [...membersList];
    for (let i = shuffledMembers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledMembers[i], shuffledMembers[j]] = [shuffledMembers[j], shuffledMembers[i]];
    }
    
    // Créer les équipes
    const teams: string[][] = Array(teamCount).fill(0).map(() => []);
    
    // Répartition équilibrée des membres
    const membersPerTeam = Math.floor(shuffledMembers.length / teamCount);
    const extraMembers = shuffledMembers.length % teamCount;
    
    let memberIndex = 0;
    
    // Distribuer les membres de manière équilibrée
    for (let i = 0; i < teamCount; i++) {
      const teamSize = i < extraMembers ? membersPerTeam + 1 : membersPerTeam;
      
      for (let j = 0; j < teamSize; j++) {
        if (memberIndex < shuffledMembers.length) {
          teams[i].push(shuffledMembers[memberIndex]);
          memberIndex++;
        }
      }
    }
    
    // Créer l'embed pour afficher les équipes
    const teamsEmbed = new EmbedBuilder()
      .setTitle("`🏆` **Équipes formées**")
      .setDescription(`*${shuffledMembers.length} membres répartis en ${teamCount} équipes*`)
      .setColor(config.color as ColorResolvable)
      .setTimestamp();
    
    // Ajouter chaque équipe à l'embed
    teams.forEach((team, index) => {
      teamsEmbed.addFields({
        name: `\`👥\` **Équipe ${index + 1}** (${team.length} membres)`,
        value: team.length > 0 ? team.map(member => `• ${member}`).join('\n') : "Équipe vide",
        inline: false
      });
    });
    
    // Répondre avec l'embed des équipes
    await interaction.reply({
      embeds: [teamsEmbed]
    });
  }
);

export default command;