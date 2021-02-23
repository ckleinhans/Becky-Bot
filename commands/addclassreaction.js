const { classRegisterChannelId, emoji } = require("../config.json");

module.exports = {
  name: "addclassreaction",
  description:
    "Debug command to add class reactions to messages in the class channel.",
  usage: "<message ID>",
  cooldown: 5,
  args: true,
  serverOnly: true,
  adminOnly: true,
  aliases: ["ar"],

  execute(message, args) {
    message.guild.channels.cache
      .get(classRegisterChannelId)
      .messages.fetch(args[0])
      .then((react) => react.react(emoji))
      .catch(console.error);
  },
};
