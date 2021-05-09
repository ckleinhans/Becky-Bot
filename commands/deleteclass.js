const { classRegisterChannelId, levels } = require("../config.json");
const {
  getClassData,
  setClassData,
  findClass,
  handleError,
} = require("../index.js");

module.exports = {
  name: "deleteclass",
  description:
    "Completely removes a class from the server permanently without archiving it.",
  usage: "<class name>",
  cooldown: 5,
  args: true,
  serverOnly: true,
  adminOnly: true,
  aliases: ["dc"],

  execute(message, args) {
    if (args.length < 1) {
      return message.channel.send(
        `Improper usage of ${this.name}. Usage: ${prefix}${this.name} ${this.usage}`
      );
    }

    let classCategories = getClassData();

    const classInfo = findClass(args[0], "className");
    const className = classInfo.className;

    // Move channel to archive and update permissions
    const classChannel = message.guild.channels.resolve(classInfo.channelId);
    classChannel
      .delete()
      .then(console.log(`DELETED channel ${className}`))
      .catch((error) => handleError(error));

    // Delete message in class registration channel
    message.guild.channels
      .resolve(classRegisterChannelId)
      .messages.fetch(classInfo.messageId)
      .then((messageObj) => messageObj.delete())
      .catch((error) => handleError(error));

    // Delete class role
    message.guild.roles
      .resolve(classInfo.roleId)
      .delete("Class deleted")
      .then(console.log(`Deleted role ${className}`))
      .catch((error) => handleError(error));

    // Remove class from classData
    for (let i = 0; i < classCategories.length; i++) {
      for (let j = 0; j < classCategories[i].classes.length; j++) {
        if (classCategories[i].classes[j].className == className) {
          classCategories[i].classes.splice(j, 1);
        }
      }
    }

    // Update classes list
    setClassData(classCategories);
    message.channel.send(`Class ${className} has been DELETED.`);
    return;
  },
};
