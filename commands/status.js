const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { adminRoleId } = require("../config.json");

/*
Sets the bot's activity status type and message.
*/

module.exports = {
  global: false,
  roleIds: [adminRoleId],
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Sets my status or activity message!")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of activity")
        .setRequired(true)
        .addChoice("playing", "PLAYING")
        .addChoice("listening", "LISTENING")
        .addChoice("watching", "WATCHING")
        .addChoice("streaming", "STREAMING")
        .addChoice("competing", "COMPETING")
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The activity message")
        .setRequired(true)
    ),
  async execute(interaction) {
    const type = interaction.options.getString("type");
    const message = interaction.options.getString("message");
    interaction.client.user.setActivity(message, { type: type });

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setDescription(`${type} ${message}`)
      .setAuthor(
        `Successfully updated status`,
        interaction.client.user.avatarURL()
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
