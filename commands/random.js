const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

/*
Replies with a random number in the specified bounds.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("random")
    .setDescription(
      "Get a random number in a given range. Optionally specify a minimum value."
    )
    .addIntegerOption((option) =>
      option
        .setName("maximum")
        .setDescription("The maximum value")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("minimum")
        .setDescription("The optional minimum value")
        .setRequired(false)
    ),
  async execute(interaction) {
    const max = interaction.options.getInteger("maximum");
    const min = interaction.options.getInteger("minimum");
    if (min) {
      if (max < min) {
        await interaction.reply({
          content: `I don't think ${max} is greater than ${min}...`,
          ephemeral: true,
        });
      } else {
        const difference = max - min + 1;
        const embed = new MessageEmbed()
          .setColor("#ff0000")
          .setTitle("Bucky's lucky number is...")
          .setDescription(
            `**${Math.ceil(Math.random() * difference) + min - 1}**`
          );
        await interaction.reply({ embeds: [embed] });
      }
    } else {
      const embed = new MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Bucky's lucky number is...")
        .setDescription(`**${Math.ceil(Math.random() * max)}**`);
      await interaction.reply({ embeds: [embed] });
    }
  },
};
