const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { prankRoleId } = require("../config.json");

/*
Command used to add prank role to users.
*/

module.exports = {
  global: false,
  data: new SlashCommandBuilder()
    .setName("onion")
    .setDescription("Get 🧅-ed!")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to 🧅").setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const role = await interaction.guild.roles.fetch(prankRoleId);
    const member = await interaction.guild.members.fetch(user.id);
    let action;

    if (member.roles.cache.has(prankRoleId)) {
      member.roles.remove(role, `${interaction.user.tag} used /onion`);
      action = "was 🔪-ed.";
    } else {
      member.roles.add(role, `${interaction.user.tag} used /onion`);
      action = "got 🧅-ed!";
    }

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setAuthor(`${user.username} ${action}`, user.avatarURL());

    await interaction.reply({ embeds: [embed] });
  },
};
