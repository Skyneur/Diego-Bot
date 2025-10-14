import { Client, CommandInteraction, EmbedBuilder, ColorResolvable, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "@src/handlers/commands";
import { Emojis } from "@src/constants/emojis";
import config from "@src/config";
import { _T } from "@src/utils/translator";

const command = new Command<[Client, CommandInteraction]>(
  "slash",
  "emojis",
  "Affiche les émojis disponibles (bot et serveur)",
  null,
  [
    {
      name: "type",
      description: "Type d'émojis à afficher",
      type: "String",
      required: false,
      choices: [
        { name: "Bot", value: "bot" },
        { name: "Serveur", value: "server" },
        { name: "Tous", value: "all" }
      ]
    }
  ],
  async (client, interaction) => {
    // On convertit l'interaction en ChatInputCommandInteraction pour accéder aux options
    const chatInteraction = interaction as ChatInputCommandInteraction;
    const type = chatInteraction.options.getString("type") || "all";
    
    // Préparation des catégories d'émojis du bot
    const botEmojiCategories: { [key: string]: string } = {
      "Connexion": `${Emojis.GOOD_CONNECTION} ${Emojis.MID_CONNECTION} ${Emojis.LOW_CONNECTION}`,
      "Présence": `${Emojis.ONLINE} ${Emojis.OFFLINE} ${Emojis.IDLE} ${Emojis.DND}`,
      "Présence animée": `${Emojis.ONLINE_GIF} ${Emojis.IDLE_GIF} ${Emojis.DND_GIF}`,
      "Jeux": `${Emojis.LOL} ${Emojis.VALORANT}`,
      "Indicateurs": `${Emojis.CROW} ${Emojis.CROSS2} ${Emojis.CHECK2} ${Emojis.CROSS} ${Emojis.CHECK} ${Emojis.NEW} ${Emojis.NEW2}`,
      "Autres": `${Emojis.TROLL_CAT}`
    };
    
    // Créer un embed pour les émojis du bot
    const botEmbed = new EmbedBuilder()
      .setTitle(`${Emojis.FOLDER} **Émojis du Bot**`)
      .setDescription("*Liste des émojis personnalisés utilisés par le bot.*")
      .setColor(config.color as ColorResolvable)
      .setTimestamp();
    
    // Ajouter les catégories d'émojis du bot
    Object.entries(botEmojiCategories).forEach(([category, emojis]) => {
      botEmbed.addFields({ name: `**${category}**`, value: emojis, inline: true });
    });
    
    // Si le type est "bot" uniquement, on répond avec l'embed du bot
    if (type === "bot") {
      await interaction.reply({ embeds: [botEmbed] });
      return;
    }
    
    // Récupérer les émojis du serveur si nécessaire
    if (type === "server" || type === "all") {
      // Vérifier que l'interaction a bien lieu dans un serveur
      if (!interaction.guild) {
        await interaction.reply({ 
          content: "Cette commande ne peut être utilisée que dans un serveur.", 
          ephemeral: true 
        });
        return;
      }
      
      // Récupérer les émojis du serveur
      const guildEmojis = interaction.guild.emojis.cache;
      
      // S'il n'y a pas d'émojis dans le serveur
      if (guildEmojis.size === 0 && type === "server") {
        await interaction.reply({ 
          content: "Ce serveur ne possède pas d'émojis personnalisés.", 
          ephemeral: true 
        });
        return;
      }
      
      // Créer un embed pour les émojis du serveur
      const serverEmbed = new EmbedBuilder()
        .setTitle(`${Emojis.FOLDER} **Émojis du Serveur**`)
        .setDescription(`*Ce serveur possède ${guildEmojis.size} émojis personnalisés.*`)
        .setColor(config.color as ColorResolvable)
        .setTimestamp();
      
      // Diviser les émojis en animés et statiques
      const animatedEmojis = guildEmojis.filter(emoji => emoji.animated).map(emoji => emoji.toString()).join(" ");
      const staticEmojis = guildEmojis.filter(emoji => !emoji.animated).map(emoji => emoji.toString()).join(" ");
      
      // Ajouter les émojis au embed
      if (staticEmojis) {
        serverEmbed.addFields({ name: "**Émojis statiques**", value: staticEmojis || "*Aucun*", inline: false });
      }
      
      if (animatedEmojis) {
        serverEmbed.addFields({ name: "**Émojis animés**", value: animatedEmojis || "*Aucun*", inline: false });
      }
      
      // Si le type est "server" uniquement, on répond avec l'embed du serveur
      if (type === "server") {
        await interaction.reply({ embeds: [serverEmbed] });
        return;
      }
      
      // Si le type est "all", on envoie les deux embeds avec un menu de sélection
      if (type === "all") {
        // Créer un menu déroulant pour choisir entre les émojis du bot et du serveur
        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('emoji_select')
              .setPlaceholder('Choisir le type d\'émojis à afficher')
              .addOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel('Émojis du Bot')
                  .setDescription('Afficher les émojis personnalisés du bot')
                  .setValue('bot')
                  .setDefault(true),
                new StringSelectMenuOptionBuilder()
                  .setLabel('Émojis du Serveur')
                  .setDescription('Afficher les émojis personnalisés du serveur')
                  .setValue('server')
              )
          );
        
        // Envoyer l'embed initial avec le menu
        const response = await interaction.reply({ 
          embeds: [botEmbed], 
          components: [row],
          fetchReply: true
        });
        
        // Créer un collecteur pour les interactions avec le menu
        const collector = response.createMessageComponentCollector({ 
          componentType: ComponentType.StringSelect,
          time: 60000 // Actif pendant 1 minute
        });
        
        collector.on('collect', async i => {
          // Vérifier que c'est l'utilisateur qui a initié la commande
          if (i.user.id !== interaction.user.id) {
            await i.reply({ content: 'Vous ne pouvez pas utiliser ce menu.', ephemeral: true });
            return;
          }
          
          // Mettre à jour l'embed selon la sélection
          await i.update({ 
            embeds: [i.values[0] === 'bot' ? botEmbed : serverEmbed],
            components: [
              new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(
                  StringSelectMenuBuilder.from(i.component)
                    .setOptions(
                      new StringSelectMenuOptionBuilder()
                        .setLabel('Émojis du Bot')
                        .setDescription('Afficher les émojis personnalisés du bot')
                        .setValue('bot')
                        .setDefault(i.values[0] === 'bot'),
                      new StringSelectMenuOptionBuilder()
                        .setLabel('Émojis du Serveur')
                        .setDescription('Afficher les émojis personnalisés du serveur')
                        .setValue('server')
                        .setDefault(i.values[0] === 'server')
                    )
                )
            ]
          });
        });
        
        // Quand le temps est écoulé, supprimer les composants interactifs
        collector.on('end', async () => {
          // Récupérer le dernier embed affiché
          const currentEmbed = response.embeds[0];
          
          try {
            await interaction.editReply({
              embeds: [EmbedBuilder.from(currentEmbed)],
              components: []
            });
          } catch (error) {
            // Si l'edit échoue, ignorer l'erreur (message probablement supprimé)
          }
        });
        
        return;
      }
    }
  }
);

export default command;