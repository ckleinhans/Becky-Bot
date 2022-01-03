const { SlashCommandBuilder } = require("@discordjs/builders");
const { adminRoleId } = require("../config.json");
const { MessageEmbed } = require("discord.js");

/*
Command used to set a user's balance or experience.
*/

module.exports = {
  global: false,
  roleIds: [adminRoleId],
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription("Sets a user's balance or experience.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("balance")
        .setDescription("Sets a user's balance.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User whose balance to modify")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Amount to set their balance to")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("experience")
        .setDescription("Set a user's experience.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User whose experience to modify")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Amount to set their experience to")
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
      data = await interaction.client.userData.addBalance(
        user.id,
        amount - interaction.client.userData.getBalance(user.id)
      );
    } else if (subcommand === "experience") {
      data = await interaction.client.userData.addExperience(
        user.id,
        amount - interaction.client.userData.getExperience(user.id)
      );

      // Check for rank change if user is not a bot
      try {
        if (!user.bot)
          await interaction.client.checkRank(
            await interaction.guild.members.fetch(user)
          );
      } catch (error) {
        return await interaction.client.handleError(
          `Error updating rank for ${user.tag} after setting experience`,
          error,
          interaction
        );
      }
    }

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setDescription(`New ${subcommand}: ${data[subcommand]}`)
      .setAuthor(`Set ${user.username}'s ${subcommand}`, user.avatarURL());
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
