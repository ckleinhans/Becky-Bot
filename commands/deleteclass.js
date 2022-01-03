const { SlashCommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");
const { MessageEmbed } = require("discord.js");
const { adminRoleId, classJoinChannelId } = require("../config.json");

/*
Command used to delete classes (does not archive them).
*/

module.exports = {
  global: false,
  roleIds: [adminRoleId],
  data: new SlashCommandBuilder()
    .setName("deleteclass")
    .setDescription("Deletes the specified class or the current class channel.")
    .addChannelOption((option) =>
      option
        .setName("class")
        .setDescription(
          "The class channel to delete if not the active channel."
        )
        .setRequired(false)
        .addChannelType(ChannelType.GuildText)
    ),
  async execute(interaction) {
    const { categoryData, classData } = interaction.client;
    const channel =
      interaction.options.getChannel("class") ?? interaction.channel;

    // Get class object from classData based on channel ID
    const classObj = classData.find((c) => c.channelId === channel.id);

    // If no class object matches channel ID, return error message
    if (!classObj) {
      return await interaction.reply({
        content: `There is no class associated with channel ${channel}`,
        ephemeral: true,
      });
    }

    // Delete message in class registration channel
    const classJoinChannel = await interaction.guild.channels.fetch(
      classJoinChannelId
    );
    await classJoinChannel.messages.delete(classObj.messageId);
    console.log(`Deleted join message for ${classObj.name}`);

    // Delete class role
    const role = await interaction.guild.roles.fetch(classObj.roleId);
    await role.delete("Class deleted");
    console.log(`Deleted role for ${classObj.name}`);

    // Delete channel
    const classChannel = await interaction.guild.channels.fetch(
      classObj.channelId
    );
    await classChannel.delete("Class deleted");
    console.log(`Deleted channel ${classObj.name}`);

    // Decrement category classes & remove class data using helper functions
    await categoryData.addClass(classObj.categoryId, -1);
    await classData.deleteClass(classObj.name);

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setAuthor(
        `Deleted class ${classObj.name}`,
        interaction.client.user.avatarURL()
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
