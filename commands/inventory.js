const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { Users } = require("../dbObjects.js");

/*
Command used to get a user's inventory.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Shows your inventory."),
  async execute(interaction) {
    // Get user and their items
    const user = await Users.findOne({
      where: { user_id: interaction.user.id },
    });
    const items = await user?.getItems();

    let itemString;
    if (!items?.length) {
      itemString = `It's empty.`;
    } else {
      itemString = `${items
        .map((i) => `**${i.item.icon} ${i.item.name} ─** ${i.amount}`)
        .join("\n")}`;
    }

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setDescription(itemString)
      .setAuthor(
        `${interaction.user.username}'s inventory`,
        interaction.user.avatarURL()
      );

    await interaction.reply({ embeds: [embed] });
  },
};
