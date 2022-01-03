const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { currencyName, experienceName } = require("../config.json");

/*
Command used to display the people with the most money or experience.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription(
      "Displays a list of the users with the most money or experience."
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("bal")
        .setDescription("Displays a list of the users with the most money.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("exp")
        .setDescription(
          "Displays a list of the users with the most experience."
        )
    ),
  async execute(interaction) {
    const prop =
      interaction.options.getSubcommand() === "bal" ? "balance" : "experience";

    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    const rankings = await Promise.all(
      interaction.client.userData
        .sort((a, b) => b[prop] - a[prop])
        .first(10)
        .map(async (userData, position) => {
          const user = await interaction.client.users.fetch(userData.user_id);
          return `${emojis[position]} ${user.username} ─ ${userData[prop]} ${
            prop === "balance" ? currencyName : experienceName
          }`;
        })
    );

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setTitle(
        prop === "balance" ? "💰  Richest Users" : "🌟  Most Experienced Users"
      )
      .setDescription(rankings.join("\n"));

    await interaction.reply({ embeds: [embed] });
  },
};
