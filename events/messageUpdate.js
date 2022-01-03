const { guildId } = require("../config.json");

/*
Handles the messageUpdate event, emitted when a user edits a message.
*/

module.exports = {
  name: "messageUpdate",
  async execute(oldMessage, newMessage) {
    // Don't check messages not from guild in config
    if (newMessage.guildId !== guildId) return;

    // if new message includes #pin, message isn't pinned
    // and message is in category in the categories list, pin message
    if (
      newMessage.content.includes("#pin") &&
      !newMessage.pinned &&
      newMessage.client.categoryData.find(
        (c) => c.id === newMessage.channel.parentId
      )
    ) {
      newMessage
        .pin()
        .then(() =>
          console.log(
            `Pinned message from ${newMessage.author.tag} in ${newMessage.channel.name}`
          )
        )
        .catch((error) =>
          newMessage.client.handleError(
            `Error pinning message from ${newMessage.author.tag} in ${newMessage.channel.name}`,
            error
          )
        );

      // If message pinned, new message doesnt include pin,
      // and message is in category in categories list, unpin message
    } else if (
      !newMessage.content.includes("#pin") &&
      newMessage.pinned &&
      newMessage.client.categoryData.find(
        (c) => c.id === newMessage.channel.parentId
      )
    ) {
      newMessage
        .unpin()
        .then(() =>
          console.log(
            `Unpinned message from ${newMessage.author.tag} in ${newMessage.channel.name}`
          )
        )
        .catch((error) =>
          newMessage.client.handleError(
            `Error unpinning message from ${newMessage.author.tag} in ${newMessage.channel.name}`,
            error
          )
        );
    }
  },
};
