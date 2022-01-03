const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { currencyName } = require("../config.json");

/*
Command used to get a user's balance.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("bal")
    .setDescription("Checks your or another user's balance.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to check the balance of")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setTitle(
        `${interaction.client.userData.getBalance(user.id)} ${currencyName}`
      )
      .setAuthor(`${user.username}'s balance`, user.avatarURL());

    await interaction.reply({ embeds: [embed] });
  },
};
