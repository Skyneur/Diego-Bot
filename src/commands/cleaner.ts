import { Command } from "@src/handlers/commands";
import { Client, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable, Routes, TextChannel, Collection, Message, ChannelType, User, GuildMember, MessageFlags } from "discord.js";
import { REST } from "@discordjs/rest";
import { _T } from "@src/utils/translator";
import config from "@src/config";
import fs from "fs";
import path from "path";

const command = new Command<[Client, ChatInputCommandInteraction]>(
  "slash",
  "cleaner",
  "Nettoyer les commandes du bot ou les messages d'un canal",
  null,
  [
    {
      type: "String",
      name: "action",
      description: "Action à effectuer",
      required: true,
      choices: [
        { name: "Nettoyer les commandes", value: "commands" },
        { name: "Supprimer des messages", value: "messages" }
      ]
    },
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
    
    const action = interaction.options.getString("action");
    
    if (action === "commands") {
      await cleanCommands(client, interaction);
    } else if (action === "messages") {
      await cleanMessages(client, interaction);
    } else {
      const errorEmbed = new EmbedBuilder()
        .setTitle("`❌` **Action non valide**")
        .setDescription("Action non reconnue. Veuillez choisir 'commands' ou 'messages'.")
        .setColor("Red")
        .setTimestamp();
        
      await interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral
      });
    }
  }
);

async function cleanCommands(client: Client, interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has("Administrator")) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("`❌` **Erreur de permission**")
      .setDescription("Vous devez être administrateur pour nettoyer les commandes.")
      .setColor("Red")
      .setTimestamp();
      
    await interaction.reply({
      embeds: [errorEmbed],
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  if (!client.user) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("`❌` **Erreur système**")
      .setDescription("Erreur: Client Discord non initialisé correctement.")
      .setColor("Red")
      .setTimestamp();
      
    await interaction.editReply({ embeds: [errorEmbed] });
    return;
  }
  
  const rest = new REST({ version: "10" }).setToken(client.token as string);
  
  try {
    const existingCommands = await rest.get(
      Routes.applicationCommands(client.user.id)
    ) as Array<{ id: string, name: string }>;
    const embed = new EmbedBuilder()
      .setTitle("`🧹` **Nettoyage des commandes**")
      .setDescription("*Synchronisation des commandes avec Discord...*")
      .setColor(config.color as ColorResolvable)
      .setTimestamp();
    
    let commandList = "";
    existingCommands.forEach(cmd => {
      commandList += `\`/${cmd.name}\` (ID: ${cmd.id})\n`;
    });
    
    embed.addFields({
      name: "`📋` **Commandes existantes**",
      value: commandList || "Aucune commande trouvée",
      inline: false
    });

    embed.addFields({
      name: "`🗑️` **Suppression des commandes**",
      value: "Suppression en cours...",
      inline: false
    });
    
    await interaction.editReply({ embeds: [embed] });
    for (const command of existingCommands) {
      await rest.delete(
        Routes.applicationCommand(client.user.id, command.id)
      );
    }
    
    const commandsDir = path.join(process.cwd(), "src/commands");
    const commandFiles = fs.readdirSync(commandsDir)
      .filter(file => file.endsWith(".ts") || file.endsWith(".js"));
    
    embed.addFields({
      name: "`🔍` **Fichiers de commandes trouvés**",
      value: commandFiles.join(", ") || "Aucun fichier trouvé",
      inline: false
    });
    
    await interaction.editReply({ embeds: [embed] });
    const commands = [];
    let loadedCommands = [];
    
    for (const file of commandFiles) {
      try {
        const commandPath = `../commands/${file}`;
        delete require.cache[require.resolve(commandPath)];
        const commandModule = require(commandPath).default;
        
        if (commandModule && commandModule instanceof Command) {
          const command = commandModule;
          loadedCommands.push(command.name);
          
          if (command.type === "slash") {
            const slashCommand = {
              name: command.name,
              description: command.description,
              options: command.options.map(opt => ({
                type: getOptionType(opt.type),
                name: opt.name,
                description: opt.description,
                required: opt.required,
                choices: opt.choices && ["String", "Number"].includes(opt.type) ? opt.choices : undefined
              }))
            };
            
            commands.push(slashCommand);
          }
        }
      } catch (error) {
        console.error(`Erreur lors du chargement de ${file}:`, error);
      }
    }
    
    embed.addFields({
      name: "`✅` **Commandes chargées**",
      value: loadedCommands.join(", ") || "Aucune commande chargée",
      inline: false
    });
    
    await interaction.editReply({ embeds: [embed] });
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    embed.addFields({
      name: "`🚀` **Synchronisation terminée**",
      value: `${commands.length} commandes ont été synchronisées avec succès!`,
      inline: false
    });
    

    await interaction.editReply({ embeds: [embed] });
    
  } catch (error: any) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("`❌` **Erreur**")
      .setDescription(`*Une erreur est survenue lors de la synchronisation:*\n\`\`\`\n${error?.message || "Erreur inconnue"}\n\`\`\``)
      .setColor("Red")
      .setTimestamp();
    
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
async function cleanMessages(client: Client, interaction: ChatInputCommandInteraction) {
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

function getOptionType(type: string): number {
  switch (type) {
    case "String": return 3;
    case "Number": return 10;
    case "User": return 6;
    case "Channel": return 7;
    case "Role": return 8;
    default: return 3;
  }
}

export default command;