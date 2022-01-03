const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

/*
Command that flips a coin and sends result.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("flip")
    .setDescription("Flips a coin!"),
  async execute(interaction) {
    const paths = [
      "https://i.imgur.com/lUJzDzH.png",
      "https://i.imgur.com/zR1WDlZ.png",
    ];
    const filePath = paths[Math.floor(Math.random() * paths.length)];

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setTitle("And the result is...")
      .setImage(filePath);

    await interaction.reply({ embeds: [embed] });
  },
};
