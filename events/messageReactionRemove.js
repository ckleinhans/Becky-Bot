const { classJoinChannelId, classJoinEmoji } = require("../config.json");

/*
Handles the messageReactionRemove event, emitted when a user removes a reaction to a message.
*/

module.exports = {
  name: "messageReactionRemove",
  async execute(reaction, user) {
    // If reaction is partial (not cached), fetch into cache
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        return await reaction.client.handleError(
          `Error when fetching partial reaction for messageReactionRemove`,
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
        await guildUser.roles.remove(role);
        console.log(`Removed ${user.tag} from ${role.name}`);
      } catch (error) {
        await reaction.client.handleError(
          `Error fetching role/member or removing ${user.tag} from ${role.name}`,
          error
        );
      }
    }
  },
};
