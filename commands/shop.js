const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { Shop } = require("../dbObjects.js");
const { currencyName } = require("../config.json");

/*
Command used to display the item shop.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Shows the item shop."),
  async execute(interaction) {
    const items = await Shop.findAll();
    const itemString = items
      .map(
        (i) => `**${i.icon} ${i.name} ─** ${i.cost} ${currencyName}\n*${i.description}*`
      )
      .join("\n\n");
    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setDescription(itemString)
      .setTitle("🏷️  Item Shop");

    await interaction.reply({ embeds: [embed] });
  },
};
