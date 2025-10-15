import { Command } from "@src/handlers/commands";
import { Client, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable, TextChannel, Collection, Message, ChannelType, MessageFlags } from "discord.js";
import { _T } from "@src/utils/translator";
import { getEmoji } from "@src/constants/emojis";
import config from "@src/config";

const command = new Command<[Client, ChatInputCommandInteraction]>(
  "slash",
  "cleaner",
  "Supprimer des messages d'un canal",
  null,
  [
    { type: "Number", name: "nombre", description: "Nombre de messages à supprimer (1-100)", required: false, choices: [] },
    { type: "User", name: "utilisateur", description: "Utilisateur dont les messages doivent être supprimés", required: false, choices: [] },
    { type: "Channel", name: "canal", description: "Canal où supprimer les messages (par défaut: canal actuel)", required: false, choices: [] }
  ],
  async (client, interaction) => {
    if (!interaction.memberPermissions?.has('ManageMessages')) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${getEmoji('CROSS')} Erreur de permission`)
        .setDescription('Vous devez avoir la permission de gérer les messages pour utiliser cette commande.')
        .setColor('Red')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
      return;
    }

    const amount = interaction.options.getNumber('nombre') || 10;
    const targetUser = interaction.options.getUser('utilisateur');
    const targetChannel = (interaction.options.getChannel('canal') || interaction.channel) as TextChannel | null;

    const messageCount = Math.min(Math.max(Math.floor(amount), 1), 100);
    if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${getEmoji('CROSS')} Canal non valide`)
        .setDescription('Le canal spécifié n\'est pas un canal de texte valide.')
        .setColor('Red')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const textChannel = targetChannel as TextChannel;
      const fetchedMessages: Collection<string, Message<true>> = await textChannel.messages.fetch({ limit: 100 });

      let messagesToDelete: Message<true>[] = [...fetchedMessages.values()];
      if (targetUser) messagesToDelete = messagesToDelete.filter(m => m.author.id === targetUser.id);
      messagesToDelete = messagesToDelete.slice(0, messageCount);

      if (messagesToDelete.length === 0) {
        const infoEmbed = new EmbedBuilder()
          .setTitle(`${getEmoji('GLOBE')} Aucun message trouvé`)
          .setDescription(targetUser ? `Aucun message trouvé pour l'utilisateur ${targetUser.tag} dans ce canal.` : 'Aucun message trouvé à supprimer.')
          .setColor(config.color as ColorResolvable)
          .setTimestamp();
        await interaction.editReply({ embeds: [infoEmbed] });
        return;
      }

      if (messagesToDelete.length > 1 && messagesToDelete.every(m => Date.now() - m.createdTimestamp < 1209600000)) {
        await textChannel.bulkDelete(messagesToDelete as any);
      } else {
        for (const m of messagesToDelete) await m.delete().catch(console.error);
      }

      const resultEmbed = new EmbedBuilder()
        .setTitle(`${getEmoji('CHECK2')} Nettoyage terminé`)
        .setDescription(`*${messagesToDelete.length} messages ont été supprimés dans ${textChannel}*`)
        .setColor(config.color as ColorResolvable)
        .setTimestamp();

      if (targetUser) resultEmbed.addFields({ name: `${getEmoji('CROW')} **Messages supprimés de**`, value: `${targetUser.tag} (${targetUser.id})`, inline: false });

      await interaction.editReply({ embeds: [resultEmbed] });
    } catch (err: any) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${getEmoji('CROSS2')} Erreur`)
        .setDescription('*Une erreur est survenue lors de la suppression des messages:*' + (err?.message || 'Erreur inconnue'))
        .setColor('Red')
        .setTimestamp();
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
);

export default command;