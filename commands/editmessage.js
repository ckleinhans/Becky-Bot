const { SlashCommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");
const { MessageEmbed } = require("discord.js");
const { adminRoleId } = require("../config.json");

/*
Command used to edit sent messages to specific channels as the bot.
*/

module.exports = {
  global: false,
  roleIds: [adminRoleId],
  data: new SlashCommandBuilder()
    .setName("editmessage")
    .setDescription("Edit a previously sent bot message.")
    .setDefaultPermission(false)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel the message is in")
        .setRequired(true)
        .addChannelTypes([ChannelType.GuildText, ChannelType.GuildNews])
    )
    .addStringOption((option) =>
      option
        .setName("message_id")
        .setDescription("The ID of the message to edit")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("new_message")
        .setDescription("The new message to set")
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
    const message_id = interaction.options.getString("message_id");
    const content = interaction.options
      .getString("new_message")
      .replaceAll("\\n", "\n");
    const file = interaction.options.getString("file");

    const message = { content };
    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setDescription(content)
      .setAuthor(
        `Updated message in ${channel.name}`,
        interaction.client.user.avatarURL()
      );
    if (file) {
      message.files = [file];
      embed.setImage(file);
    }

    await channel.messages.edit(message_id, message);
    await interaction.editReply({ embeds: [embed], ephemeral: true });
  },
};
