const db = require("quick.db");
const { levels } = require("../config.json");

module.exports = {
  name: "rank",
  description:
    "Checks your current experience and how much is required to reach the next rank.",
  usage: "",
  cooldown: 5,
  args: false,
  serverOnly: false,
  adminOnly: false,
  aliases: ["level"],

  execute(message, args) {
    const user = message.mentions.users.first()
      ? message.mentions.users.first()
      : message.author;
    const messageCount = db.get(`${user.id}.messageCount`) || 0;
    let levelIndex = db.get(`${user.id}.levelIndex`);
    if (levelIndex === undefined) {
      levelIndex = -1;
    }
    const pronoun = message.mentions.users.first() ? "They" : "You";
    const mention = message.mentions.users.first() ? `${user.username} has` : "you have";
    const nextLevelMsg = user.bot
      ? "As a bot, we have no need for silly ranks as we have far surpassed the potential of you puny mortals."
      : levels[levelIndex + 1]
      ? `${pronoun} need ${
          levels[levelIndex + 1].messageCount
        } experience to reach the next rank.`
      : `${pronoun} already have the highest rank!`;
    message.reply(
      `${mention} a total of ${messageCount} experience. ${nextLevelMsg}`
    );
  },
};
