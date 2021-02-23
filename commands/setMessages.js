const db = require("quick.db");

module.exports = {
  name: "setmessages",
  description:
    "Debug command to set a user's message count.",
  usage: "<user id> <message count>",
  cooldown: 5,
  args: true,
  serverOnly: false,
  adminOnly: true,
  aliases: [],

  execute(message, args) {
    db.set(`${args[0]}.messageCount`, Number(args[1]));
    message.channel.send(`Set user ${args[0]} message count to ${args[1]}`);
  },
};
