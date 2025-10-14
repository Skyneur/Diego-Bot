import { Command } from "@src/handlers/commands";
import { Client, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable, TextChannel, Collection, Message, ChannelType, MessageFlags } from "discord.js";
import { _T } from "@src/utils/translator";
import config from "@src/config";

const command = new Command<[Client, ChatInputCommandInteraction]>(
  "slash",
  "cleaner",
  "Supprimer des messages d'un canal",
  null,
  [
    {
      type: "Number",
      name: "nombre",
      description: "Nombre de messages à supprimer (1-100)",
      required: false,
      choices: []
    },
    {
      type: "User",
      name: "utilisateur",
      description: "Utilisateur dont les messages doivent être supprimés",
      required: false,
      choices: []
    },
    {
      type: "Channel",
      name: "canal",
      description: "Canal où supprimer les messages (par défaut: canal actuel)",
      required: false,
      choices: []
    }
  ],
  async (client, interaction) => {
    if (!interaction.memberPermissions?.has("ManageMessages")) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("`❌` **Erreur de permission**")
        .setDescription("Vous devez avoir la permission de gérer les messages pour utiliser cette commande.")
        .setColor("Red")
        .setTimestamp();
        
      await interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    
    const amount = interaction.options.getNumber("nombre") || 10;
    const targetUser = interaction.options.getUser("utilisateur");
    const targetChannel = interaction.options.getChannel("canal") || interaction.channel;
    
    const messageCount = Math.min(Math.max(Math.floor(amount), 1), 100);
    if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("`❌` **Canal non valide**")
        .setDescription("Le canal spécifié n'est pas un canal de texte valide.")
        .setColor("Red")
        .setTimestamp();
        
      await interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    
    try {
      const textChannel = targetChannel as TextChannel;
      
      const startEmbed = new EmbedBuilder()
        .setTitle("`🧹` **Nettoyage des messages**")
        .setDescription(`*Suppression en cours dans ${textChannel}...*`)
        .setColor(config.color as ColorResolvable)
        .addFields({
          name: "`⚙️` **Paramètres**",
          value: `Canal: ${textChannel}\nNombre: \`${messageCount}\`${targetUser ? `\nUtilisateur: ${targetUser}` : ''}`,
          inline: false
        })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [startEmbed] });
      
      let fetchedMessages: Collection<string, Message<true>>;
      
      fetchedMessages = await textChannel.messages.fetch({ limit: 100 });

      let messagesToDelete: Message<true>[] = [...fetchedMessages.values()];
      
      if (targetUser) {
        messagesToDelete = messagesToDelete.filter(msg => msg.author.id === targetUser.id);
      }
      
      messagesToDelete = messagesToDelete.slice(0, messageCount);
      
      const deleteCount = messagesToDelete.length;
      
      if (deleteCount === 0) {
        const infoEmbed = new EmbedBuilder()
          .setTitle("`ℹ️` **Aucun message trouvé**")
          .setDescription(targetUser 
            ? `Aucun message trouvé pour l'utilisateur ${targetUser.tag} dans ce canal.`
            : "Aucun message trouvé à supprimer.")
          .setColor(config.color as ColorResolvable)
          .setTimestamp();
          
        await interaction.editReply({
          embeds: [infoEmbed]
        });
        return;
      }
      
      if (deleteCount > 1 && messagesToDelete.every(msg => Date.now() - msg.createdTimestamp < 1209600000)) {
        await textChannel.bulkDelete(messagesToDelete);
      } else {
        for (const message of messagesToDelete) {
          await message.delete().catch(console.error);
        }
      }
      
      const resultEmbed = new EmbedBuilder()
        .setTitle("`✅` **Nettoyage terminé**")
        .setDescription(`*${deleteCount} messages ont été supprimés dans ${textChannel}*`)
        .setColor(config.color as ColorResolvable)
        .setTimestamp();
      
      if (targetUser) {
        resultEmbed.addFields({
          name: "`👤` **Messages supprimés de**",
          value: `${targetUser.tag} (${targetUser.id})`,
          inline: false
        });
      }
      
      await interaction.editReply({ embeds: [resultEmbed] });
      
    } catch (error: any) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("`❌` **Erreur**")
        .setDescription(`*Une erreur est survenue lors de la suppression des messages:*\n\`\`\`\n${error?.message || "Erreur inconnue"}\n\`\`\``)
        .setColor("Red")
        .setTimestamp();
      
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
);

export default command;