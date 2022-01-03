const { SlashCommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");
const { adminRoleId } = require("../config.json");
const { MessageEmbed } = require("discord.js");

/*
Command used to send messages to specific channels as the bot.
*/

module.exports = {
  global: false,
  roleIds: [adminRoleId],
  data: new SlashCommandBuilder()
    .setName("sendmessage")
    .setDescription("Send a message to a channel as the bot.")
    .setDefaultPermission(false)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the message to")
        .setRequired(true)
        .addChannelTypes([ChannelType.GuildText, ChannelType.GuildNews])
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to send")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("file")
        .setDescription(
          "URL or path to an image/gif or other file to attach to the message."
        )
        .setRequired(false)
    ),
  async execute(interaction) {
    // Since attaching file takes long time sometimes, defer reply
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel");
    const content = interaction.options
      .getString("message")
      .replaceAll("\\n", "\n");
    const file = interaction.options.getString("file");

    const message = { content };
    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setDescription(content)
      .setAuthor(
        `Sent message to ${channel.name}`,
        interaction.client.user.avatarURL()
      );
    if (file) {
      message.files = [file];
      embed.setImage(file);
    }

    await channel.send(message);
    await interaction.editReply({ embeds: [embed], ephemeral: true });
  },
};
