const { SlashCommandBuilder } = require("@discordjs/builders");
const { developerId } = require("../config.json");
const { MessageEmbed } = require("discord.js");

/*
Command used to send suggestions to the developer.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription(
      "Send bot improvement suggestions or report bugs to the developer!"
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription(
          "Suggestion or bug to send to the developer. Be as detailed as possible!"
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const message = interaction.options.getString("message");
    const dev = await interaction.client.users.fetch(developerId);

    const devEmbed = new MessageEmbed()
      .setColor("#ff0000")
      .setDescription(message)
      .setAuthor(
        `${interaction.user.username}'s suggestion`,
        interaction.user.avatarURL()
      );
    const sent = await dev.send({ embeds: [devEmbed] });
    await sent.pin();

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setDescription(message)
      .setAuthor(
        `Sent suggestion to developer`,
        interaction.client.user.avatarURL()
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
