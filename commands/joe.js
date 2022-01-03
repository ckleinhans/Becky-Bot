const { SlashCommandBuilder } = require("@discordjs/builders");

/*
Command that replies with a clip of Joe Gatto.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder().setName("joe").setDescription("Thanks Joe."),
  async execute(interaction) {
    await interaction.reply({ files: ["./resources/thanksjoe.mp4"] });
  },
};
