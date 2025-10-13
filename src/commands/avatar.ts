import { Command } from "@src/handlers/commands";
import { Client, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable } from "discord.js";
import { _T } from "@src/utils/translator";
import config from "@src/config";

const command = new Command<[Client, ChatInputCommandInteraction]>(
  "slash",
  "avatar",
  "Afficher l'avatar d'un utilisateur",
  null,
  [
    {
      type: "User",
      name: "utilisateur",
      description: "Utilisateur dont vous souhaitez voir l'avatar",
      required: false,
      choices: []
    }
  ],
  async (client, interaction) => {
    // Récupérer l'utilisateur ciblé ou l'auteur de la commande
    const targetUser = interaction.options.getUser("utilisateur") || interaction.user;
    
    // Récupérer différentes tailles d'avatar
    const avatarURL = targetUser.displayAvatarURL({ size: 4096 });
    
    // Créer l'embed
    const embed = new EmbedBuilder()
      .setTitle(`\`🖼️\` **Avatar de ${targetUser.tag}**`)
      .setDescription(`*Cliquez sur l'image pour la voir en taille originale.*`)
      .setImage(avatarURL)
      .setColor(config.color as ColorResolvable)
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();
    
    // Options de téléchargement pour différentes tailles
    const sizes = [
      { size: 128, label: "128x128" },
      { size: 256, label: "256x256" },
      { size: 512, label: "512x512" },
      { size: 1024, label: "1024x1024" },
      { size: 2048, label: "2048x2048" },
      { size: 4096, label: "4096x4096" }
    ];
    
    // Ajouter un champ avec les liens vers différentes tailles
    let downloadLinks = "";
    sizes.forEach(({ size, label }) => {
      const url = targetUser.displayAvatarURL({ size });
      downloadLinks += `[${label}](${url}) • `;
    });
    
    // Retirer le dernier séparateur
    downloadLinks = downloadLinks.slice(0, -3);
    
    embed.addFields({
      name: '\`⬇️\` **Télécharger**',
      value: downloadLinks,
      inline: false
    });
    
    // Envoyer l'embed
    await interaction.reply({ embeds: [embed] });
  }
);

export default command;