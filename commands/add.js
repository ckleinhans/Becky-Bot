const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { adminRoleId } = require("../config.json");

/*
Command used to change a user's balance or experience.
*/

module.exports = {
  global: false,
  roleIds: [adminRoleId],
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Adds (or subtracts) to a user's balance or experience.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("balance")
        .setDescription("Add (or subtract) to a user's balance.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User whose balance to modify")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Amount to change the balance by")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("experience")
        .setDescription("Add (or subtract) to a user's experience.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User whose experience to modify")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Amount to change the balance by")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    let data;

    // modify correct property depending on subcommand
    if (subcommand === "balance") {
      data = await interaction.client.userData.addBalance(user.id, amount);
    } else if (subcommand === "experience") {
      data = await interaction.client.userData.addExperience(user.id, amount);

      // Check for rank change if user is not a bot
      try {
        if (!user.bot)
          await interaction.client.checkRank(
            await interaction.guild.members.fetch(user)
          );
      } catch (error) {
        return await interaction.client.handleError(
          `Error updating rank for ${user.tag} after adding experience`,
          error,
          interaction
        );
      }
    }

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setDescription(`New ${subcommand}: ${data[subcommand]}`)
      .setAuthor(`Added to ${user.username}'s ${subcommand}`, user.avatarURL());
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
