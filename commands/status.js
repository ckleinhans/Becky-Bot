const { client } = require("../index.js");

const activityTypes = [
  "playing",
  "streaming",
  "listening",
  "watching",
  "competing",
  "custom",
];

module.exports = {
  name: "status",
  description: "Set my status activity or message!",
  usage: `<${activityTypes.join("|")}> <name/message>`,
  cooldown: 5,
  args: true,
  serverOnly: false,
  adminOnly: true,
  aliases: ["setstatus"],

  execute(message, args) {
    activityType = args.shift().toLowerCase();
    if (!activityTypes.includes(activityType)) {
      return message.channel.send(
        `Improper usage of ${command.name}. Usage: ${config.prefix}${command.name} ${command.usage}`
      );
    }
    if (activityType == "custom") {
      client.user.setActivity(args.join(" "));
    } else {
      client.user.setActivity(args.join(" "), {
        type: activityType.toUpperCase(),
      });
    }
    console.log(
      `Set status to ${activityType.toUpperCase()}: ${args.join(" ")}`
    );
  },
};
