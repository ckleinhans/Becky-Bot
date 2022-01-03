const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { experienceName, ranks } = require("../config.json");

/*
Command used to get a user's experience and rank.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Checks your or another user's rank.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to check the rank of")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    const data = interaction.client.userData.get(user.id) ?? {
      experience: 0,
      rank: 0,
    };
    const rank = ranks[data.rank];

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setTitle(`${rank.icon}\n${rank.name}`)
      .setDescription(
        `${data.experience} ${
          rank.maxExperience ? `/ ${rank.maxExperience + 1}` : ""
        } ${experienceName}`
      )
      .setAuthor(`${user.username}'s rank`, user.avatarURL());

    await interaction.reply({ embeds: [embed] });
  },
};
