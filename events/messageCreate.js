const { guildId, prankEmojis, prankRoleId } = require("../config.json");
/*
Handles the messageCreate event, emitted when a user sends a message.
*/

module.exports = {
  name: "messageCreate",
  async execute(message) {
    // Don't check messages not from guild in config
    if (message.guildId !== guildId) return;

    // If user has prank role, react with emoji from config list
    if (message.member.roles.cache.has(prankRoleId)) {
      message
        .react(prankEmojis[Math.floor(Math.random() * prankEmojis.length)])
        .then(() =>
          console.log(`Pranked ${message.author.tag} with random emoji`)
        )
        .catch((error) =>
          message.client.handleError(
            `Error when trying to prank react to message from ${member.tag}`,
            error
          )
        );
    }

    // if message includes #pin and is in a category in categories list, pin message
    if (
      message.content.includes("#pin") &&
      message.client.categoryData.find((c) => c.id === message.channel.parentId)
    ) {
      message
        .pin()
        .then(() =>
          console.log(
            `Pinned message from ${message.author.tag} in ${message.channel.name}`
          )
        )
        .catch((error) =>
          client.handleError(
            `Error pinning message from ${message.author.tag} in ${message.channel.name}`,
            error
          )
        );
    }

    // Use helper function to count sent messages and add experience
    await message.client.userData.messageSent(message.author.id);

    // If message isn't from bot, check if user should rank up or down
    if (message.author.bot) return;

    // If user's rank is updated, send notification message
    try {
      if (await message.client.checkRank(message.member)) {
        // TODO make notification message
      }
    } catch (error) {
      await message.client.handleError(
        `Error updating rank for ${message.author.tag} in messageCreate`,
        error
      );
    }

    // If class channel, increment class message count
    const classObj = message.client.classData.find(
      (c) => c.channelId === message.channel.id
    );
    if (classObj) {
      classObj.numMessages += 1;
      return classObj.save();
    }
  },
};
