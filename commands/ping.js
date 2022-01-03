const { SlashCommandBuilder } = require("@discordjs/builders");

/*
Ping command used to test bot's responsiveness.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
