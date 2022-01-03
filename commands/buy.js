const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { Op } = require("sequelize");
const { Shop, Users } = require("../dbObjects.js");
const { currencyName } = require("../config.json");

/*
Command used to purchase items in the item shop.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Purchase items from the item shop.")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("The name of the item to buy.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of the item to buy.")
        .setRequired(false)
    ),
  async execute(interaction) {
    const itemName = interaction.options.getString("item");
    const amount = interaction.options.getInteger("amount") || 1;
    const item = await Shop.findOne({
      where: { name: { [Op.like]: itemName } },
    });

    if (!item)
      return await interaction.reply({
        content: `There is no such item as ${itemName}.`,
        ephemeral: true,
      });

    if (amount <= 0)
      return await interaction.reply({
        content: `You cannot buy an amount of items less than 0!`,
        ephemeral: true,
      });

    const balance = interaction.client.userData.getBalance(interaction.user.id);
    const cost = item.cost * amount;
    if (cost > balance) {
      return await interaction.reply({
        content: `You currently have ${balance} ${currencyName}, but ${amount} ${item.icon} ${item.name} costs ${cost} ${currencyName}!`,
        ephemeral: true,
      });
    }

    const user = await Users.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.client.userData.addBalance(interaction.user.id, -cost);
    await user.addItems(item, amount);

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setTitle(
        `You purchased ${amount} ${item.icon} ${item.name} for ${cost} ${currencyName}!`
      )
      .setDescription(
        `You have ${interaction.client.userData.getBalance(
          interaction.user.id
        )} ${currencyName} remaining.`
      )
      .setAuthor(
        `${interaction.user.username}'s purchase`,
        interaction.user.avatarURL()
      );

    await interaction.reply({ embeds: [embed] });
  },
};
