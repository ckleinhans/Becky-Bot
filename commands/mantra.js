const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const quotes = require("../quotes.json");

/*
Sends a quote that changes every day.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("mantra")
    .setDescription("Sends Becky's daily mantra. Words to live by!"),
  async execute(interaction) {
    const date = new Date();
    const dateHash =
      (12 * date.getYear() + date.getMonth()) * 31 + date.getDate();
    const numericalDate = date.getDate();

    let dateString = `${date.toLocaleString("default", {
      month: "long",
    })} ${numericalDate}`;

    if (numericalDate > 3 && numericalDate < 21) {
      dateString += "th";
    } else {
      switch (numericalDate % 10) {
        case 1:
          dateString += "st";
          break;
        case 2:
          dateString += "nd";
          break;
        case 3:
          dateString += "rd";
          break;
        default:
          dateString += "th";
      }
    }

    const index = dateHash % quotes.length;

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setTitle(`My ${dateString} mantra,`)
      .setDescription(quotes[index].quoteText)
      .setFooter(
        quotes[index].quoteAuthor !== "" ? quotes[index].quoteAuthor : "Unknown"
      );

    await interaction.reply({ embeds: [embed] });
  },
};
