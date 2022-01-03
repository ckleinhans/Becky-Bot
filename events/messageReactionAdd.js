const { classJoinChannelId, classJoinEmoji } = require("../config.json");

/*
Handles the messageReactionAdd event, emitted when a user reacts to a message.
*/

module.exports = {
  name: "messageReactionAdd",
  async execute(reaction, user) {
    // If reaction is partial (not cached), fetch into cache
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        return await reaction.client.handleError(
          `Error when fetching partial reaction for messageReactionAdd`,
          error
        );
      }
    }

    // Don't check bot reactions
    if (user.bot) return;

    // If reaction is class join emoji & in class join channel, add to class
    if (
      reaction.emoji.toString() === classJoinEmoji &&
      reaction.message.channelId === classJoinChannelId
    ) {
      // Find class associated with message id
      const classData = reaction.client.classData.find(
        (c) => c.messageId === reaction.message.id
      );

      // If class doesn't exist, return early
      if (!classData) return;

      try {
        // Try to fetch role and guild member
        const role = await reaction.message.guild.roles.fetch(classData.roleId);
        const guildUser = await reaction.message.guild.members.fetch(user.id);

        // Add role to guild member
        await guildUser.roles.add(role);
        console.log(`Added ${user.tag} to ${role.name}`);
      } catch (error) {
        await reaction.client.handleError(
          `Error fetching role/member or adding ${user.tag} to ${role.name}`,
          error
        );
      }
    }
  },
};
