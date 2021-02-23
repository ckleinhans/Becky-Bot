const db = require("quick.db");

module.exports = {
  name: "setrank",
  description:
    "Debug command to set a user's rank index.",
  usage: "<user id> <rank index>",
  cooldown: 5,
  args: true,
  serverOnly: false,
  adminOnly: true,
  aliases: [],

  execute(message, args) {
    db.set(`${args[0]}.levelIndex`, Number(args[1]));
    message.channel.send(`Set user ${args[0]} rank index to ${args[1]}`);
  },
};
