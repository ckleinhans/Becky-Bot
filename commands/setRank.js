const { SlashCommandBuilder } = require("@discordjs/builders");
const { rankManagerRoleId, ranks } = require("../config.json");
const { MessageEmbed } = require("discord.js");

/*
Command used to set a user's rank.
*/

module.exports = {
  global: false,
  roleIds: [rankManagerRoleId],
  data: new SlashCommandBuilder()
    .setName("setrank")
    .setDescription("Sets a user's rank.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User whose rank to modify")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("name")
        .setDescription("Rank to set the user to")
        .setRequired(true)
        .addChoices(ranks.map((r, index) => [r.name, index]))
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const rankIndex = interaction.options.getInteger("name");
    let data = interaction.client.userData.get(user.id);

    // Find desired rank
    const rank = ranks[rankIndex];

    // Check that user's experience would fit with the rank
    if (
      (rank.maxExperience && data.experience > rank.maxExperience) ||
      (rank.minExperience && data.experience < rank.minExperience)
    ) {
      // Experience doesn't lie in rank range, return error message
      return await interaction.reply({
        content: `Could not set rank of ${user.tag} to ${
          rank.name
        } since user's experience (${
          data.experience
        }) does not lie in rank's range(${rank.minExperience || "0"}-${
          rank.maxExperience || "∞"
        })`,
        ephemeral: true,
      });
    }
    // User's experience is ok for new rank, so update roles and set rank
    const member = await interaction.guild.members.fetch(user);
    // Add user to new role if it exists
    if (rank.roleId) {
      await member.roles.add(
        rank.roleId,
        `User's rank was manually set by ${interaction.user.tag}`
      );
    }
    // Remove user from old role if it exists
    if (ranks[data.rank].roleId) {
      await member.roles.remove(
        ranks[data.rank].roleId,
        `User's rank was manually set by ${interaction.user.tag}`
      );
    }
    data.rank = rankIndex;
    data.save();

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setDescription(`New Rank: ${rank.name}`)
      .setAuthor(`Updated ${user.username}'s rank`, user.avatarURL());
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
