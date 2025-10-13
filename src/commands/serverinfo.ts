import { Command } from "@src/handlers/commands";
import { Client, CommandInteraction, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable, MessageFlags } from "discord.js";
import { _T } from "@src/utils/translator";
import config from "@src/config";

const command = new Command<[Client, ChatInputCommandInteraction]>(
  "slash",
  "serverinfo",
  "Afficher les informations détaillées du serveur",
  null,
  [],
  async (client, interaction) => {
    if (!interaction.guild) {
      await interaction.reply({
        content: "Cette commande ne peut être utilisée que dans un serveur.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const guild = await interaction.guild.fetch();
    
    const totalMembers = guild.memberCount;
    const humans = guild.members.cache.filter(member => !member.user.bot).size;
    const bots = guild.members.cache.filter(member => member.user.bot).size;
    
    const textChannels = guild.channels.cache.filter(c => c.isTextBased()).size;
    const voiceChannels = guild.channels.cache.filter(c => c.isVoiceBased()).size;
    const categories = guild.channels.cache.filter(c => c.type === 4).size;
    
    const roles = guild.roles.cache.size - 1;
    
    const creationDate = guild.createdAt.toLocaleDateString("fr-FR");
    const serverAge = calculateAge(guild.createdAt);
    
    const boostLevel = guild.premiumTier;
    const boostCount = guild.premiumSubscriptionCount || 0;
    
    const embed = new EmbedBuilder()
      .setTitle(`\`🔍\` **Informations sur ${guild.name}**`)
      .setDescription(`*Voici les informations détaillées du serveur.*`)
      .setThumbnail(guild.iconURL() || '')
      .setColor(config.color as ColorResolvable)
      .addFields(
        { name: '\`👑\` **Propriétaire**', value: `<@${guild.ownerId}>`, inline: true },
        { name: '\`🆔\` **ID**', value: `\`${guild.id}\``, inline: true },
        { name: '\`📆\` **Créé le**', value: `\`${creationDate} (${serverAge})\``, inline: true },
        { name: '\`👥\` **Membres**', value: `\`${totalMembers}\` (🧑 \`${humans}\` | 🤖 \`${bots}\`)`, inline: true },
        { name: '\`🏆\` **Niveau de boost**', value: `\`${boostLevel}\` (${boostCount} boost${boostCount > 1 ? 's' : ''})`, inline: true },
        { name: '\`🔒\` **Niveau de vérification**', value: `\`${getVerificationLevel(guild.verificationLevel)}\``, inline: true },
        { name: '\`📊\` **Statistiques**', value: `
          • 💬 \`${textChannels}\` salons textuels
          • 🔊 \`${voiceChannels}\` salons vocaux
          • 📁 \`${categories}\` catégories
          • 🎭 \`${roles}\` rôles
        `.replace(/\n\s+/g, '\n'), inline: false }
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();
    
    if (guild.banner) {
      embed.setImage(guild.bannerURL({ size: 1024 }) || '');
    }
    
    await interaction.reply({ embeds: [embed] });
  }
);

function calculateAge(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;
  
  let age = '';
  if (years > 0) age += `${years} an${years > 1 ? 's' : ''} `;
  if (months > 0 || years > 0) age += `${months} mois `;
  age += `${days} jour${days > 1 ? 's' : ''}`;
  
  return age;
}

function getVerificationLevel(level: number): string {
  switch (level) {
    case 0: return "Aucune";
    case 1: return "Faible";
    case 2: return "Moyenne";
    case 3: return "Élevée";
    case 4: return "Très élevée";
    default: return "Inconnu";
  }
}

export default command;