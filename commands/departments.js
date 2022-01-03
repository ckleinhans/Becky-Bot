const { SlashCommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");
const { departments } = require("../departments.json");

/*
Command that sends all valid department codes to user via DM.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("departments")
    .setDescription("Replies with a list of all valid department codes."),
  async execute(interaction) {
    if (interaction.channel.type === ChannelType.DM) {
      await interaction.reply(departments.join("\n"));
    } else {
      await interaction.user.send(departments.join("\n"));
      await interaction.reply({
        content:
          "I've sent you a DM with the list of department codes. On Wisconsin!",
        ephemeral: true,
      });
    }
  },
};
