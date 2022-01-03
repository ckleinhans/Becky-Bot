const {
  classJoinChannelId,
  guildId,
  welcomeChannelId,
} = require("../config.json");

/*
Handles the guildMemberAdd event, emitted when a user joins a guild.
*/

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    // If guild id doesn't match id in config, do nothing
    if (member.guild.id !== guildId) return;

    // If no welcome channel set, do nothing
    if (!welcomeChannelId) return;

    // Send welcome message to welcome channel
    try {
      const welcomeChannel = await member.guild.channels.fetch(
        welcomeChannelId
      );
      await welcomeChannel.send(
        `**Welcome to ${member.guild.name} ${member}!**\n` +
          `When you're ready to get started, head over to <#${classJoinChannelId}> to join the classes you are a part of.\n` +
          `To see a list of my commands that you can use, type **/help**.\n` +
          "On Wisconsin!"
      );
      console.log(`Sent welcome message for ${member.user.tag}`);
    } catch (error) {
      await member.client.handleError(
        `Error sending welcome message for ${member.user.tag}`,
        error
      );
    }
  },
};
