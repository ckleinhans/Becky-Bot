const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { currencyName } = require("../config.json");

/*
Command used to get a user's balance.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Pays another user from your balance.")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to pay").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription(`Amount of ${currencyName} to transfer.`)
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const currentAmount = interaction.client.userData.getBalance(
      interaction.user.id
    );
    const transferAmount = interaction.options.getInteger("amount");

    if (interaction.user.id === target.id)
      return await interaction.reply({
        content: `You can't pay yourself!`,
        ephemeral: true,
      });
    if (transferAmount > currentAmount)
      return await interaction.reply({
        content: `Oops! You only have ${currentAmount} ${currencyName}!"`,
        ephemeral: true,
      });
    if (transferAmount <= 0)
      return await interaction.reply({
        content: `You can only pay others amounts greater than 0!`,
        ephemeral: true,
      });

    await interaction.client.userData.addBalance(
      interaction.user.id,
      -transferAmount
    );
    await interaction.client.userData.addBalance(target.id, transferAmount);

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setTitle(`Paid ${target.username} ${transferAmount} ${currencyName}`)
      .setDescription(
        `You have ${interaction.client.userData.getBalance(
          interaction.user.id
        )} ${currencyName} remaining.`
      )
      .setAuthor(
        `${interaction.user.username}'s payment`,
        interaction.user.avatarURL()
      );

    await interaction.reply({ embeds: [embed] });
  },
};
