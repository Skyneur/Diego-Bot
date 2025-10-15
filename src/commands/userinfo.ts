import { Command } from "@src/handlers/commands";
import { Client, CommandInteraction, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable, GuildMember, User } from "discord.js";
import { _T } from "@src/utils/translator";
import config from "@src/config";
import { getEmoji } from "@src/constants/emojis";

const command = new Command<[Client, ChatInputCommandInteraction]>(
  "slash",
  "userinfo",
  "Afficher les informations d'un utilisateur",
  null,
  [
    {
      type: "User",
      name: "utilisateur",
      description: "Utilisateur dont vous souhaitez voir les informations",
      required: false,
      choices: []
    }
  ],
  async (client, interaction) => {
    const targetUser = interaction.options.getUser("utilisateur") || interaction.user;
    const targetMember = interaction.guild?.members.cache.get(targetUser.id);
    
    const joinDate = targetMember?.joinedAt?.toLocaleDateString("fr-FR") || "N/A";
    const accountCreated = targetUser.createdAt.toLocaleDateString("fr-FR");
    const roles = targetMember?.roles.cache.filter(role => role.id !== interaction.guild?.id).map(role => role.toString()).join(", ") || "Aucun rôle";
    const memberAge = calculateDuration(targetUser.createdAt);
    const serverAge = targetMember?.joinedAt ? calculateDuration(targetMember.joinedAt) : "N/A";
    const isBot = targetUser.bot ? "Oui" : "Non";
    const userFlags = targetUser.flags?.toArray().join(", ") || "Aucun badge";
    const status = getStatusString(targetMember);
    const nickname = targetMember?.nickname || "Aucun";
    const embed = new EmbedBuilder()
      .setTitle(`${getEmoji('PERSON')} **Informations sur ${targetUser.tag}**`)
      .setDescription(`*Voici les informations détaillées sur l'utilisateur.*`)
      .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
      .setColor(config.color as ColorResolvable)
      .addFields(
        { name: `${getEmoji('CROWN')} **ID**`, value: `\`${targetUser.id}\``, inline: true },
        { name: `${getEmoji('PIN')} **Pseudo**`, value: `\`${nickname}\``, inline: true },
        { name: `${getEmoji('ROBOT')} **Bot**`, value: `\`${isBot}\``, inline: true },
        { name: `${getEmoji('CALENDAR')} **Compte créé le**`, value: `\`${accountCreated}\` (${memberAge})`, inline: true },
        { name: `${getEmoji('TRASH')} **Rejoint le serveur le**`, value: `\`${joinDate}\` (${serverAge})`, inline: true },
        { name: `${getEmoji('THEATER')} **Statut**`, value: `\`${status}\``, inline: true },
        { name: `${getEmoji('MEDAL')} **Badges**`, value: `\`${userFlags}\``, inline: false }
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();
    
    if (roles && roles !== "Aucun rôle") {
      embed.addFields({ name: '\`👑\` **Rôles**', value: roles, inline: false });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
);
function calculateDuration(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;
  
  let duration = '';
  if (years > 0) duration += `${years} an${years > 1 ? 's' : ''} `;
  if (months > 0 || years > 0) duration += `${months} mois `;
  duration += `${days} jour${days > 1 ? 's' : ''}`;
  
  return duration;
}

function getStatusString(member: GuildMember | undefined): string {
  if (!member) return "Inconnu";
  
  const status = member.presence?.status;
  switch (status) {
    case "online": return "En ligne";
    case "idle": return "Inactif";
    case "dnd": return "Ne pas déranger";
    case "offline": return "Hors ligne";
    default: return "Inconnu";
  }
}

export default command;