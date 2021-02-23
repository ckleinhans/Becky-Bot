const { departments } = require("../departments.json");
const fs = require("fs");
const {
  prefix,
  createClassChannelId,
  classRegisterChannelId,
  emoji,
} = require("../config.json");
const {
  getClassData,
  setClassData,
  findClass,
} = require("../index.js");

module.exports = {
  name: "createclass",
  description:
    "Creates a new class for students to join with the given department and course number.",
  usage: "<department code> <course number>",
  cooldown: 5,
  args: true,
  serverOnly: true,
  adminOnly: false,
  aliases: ["newclass", "cc"],
  // eslint-disable-next-line no-unused-vars
  async execute(message, args) {
    if (message.channel.id != createClassChannelId) {
      const createChannel = message.guild.channels.cache.get(
        createClassChannelId
      );
      return message.channel.send(
        `You can only use that command in ${createChannel}.`
      );
    }
    if (args.length < 2) {
      return message.channel.send(
        `Improper usage of ${this.name}. Usage: ${prefix}${this.name} ${this.usage}`
      );
    }
    if (!departments.includes(args[0])) {
      return message.channel.send(
        `${args[0]} is not a valid department code. Use !departments to get a list of all valid codes.`
      );
    }
    if (isNaN(args[1]) || args[1] < 100 || args[1] > 999) {
      return message.channel.send(`${args[1]} isn't a valid course number.`);
    }

    const className = `${args[0]}-${args[1]}`;

    const classCategories = getClassData();

    if (findClass(className, "className")) {
      return message.channel.send(
        `There is already a class named ${className}.`
      );
    }

    let classRole;
    let classChannel;
    let joinMessage;

    try {
      // create role
      classRole = await message.guild.roles.create({
        data: {
          name: className,
          mentionable: true,
        },
      });
      console.log(`Created role ${className}`);

      // find class category with space for new class
      let classCategoryId;
      let classCategoryIndex = 0;
      while (classCategoryIndex < classCategories.length) {
        if (classCategories[classCategoryIndex].classes.length < 50) {
          classCategoryId = classCategories[classCategoryIndex].categoryId;
          break;
        } else {
          classCategoryIndex++;
        }
      }
      // if no category found, create new one
      if (!classCategoryId) {
        classCategoryId = (
          await message.guild.channels.create("My Classes", {
            type: "category",
            permissionOverwrites: [
              {
                id: message.guild.id,
                deny: ["VIEW_CHANNEL"],
              },
            ],
          })
        ).id;
      }

      // create channel
      classChannel = await message.guild.channels.create(className, {
        type: "text",
        parent: classCategoryId,
        permissionOverwrites: [
          {
            id: message.guild.roles.everyone,
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: classRole.id,
            allow: ["VIEW_CHANNEL"],
          },
        ],
      });
      console.log(`Created channel ${className}`);

      // create join message
      joinMessage = await message.guild.channels.cache
        .get(classRegisterChannelId)
        .send(className);
      await joinMessage.react(emoji);
      console.log(`Sent message and reaction for ${className}`);

      classCategories[classCategoryIndex].classes.push({
        className: className,
        messageId: joinMessage.id,
        channelId: classChannel.id,
        roleId: classRole.id,
      });
      message.channel.send(
        `Class ${className} created! Join in ${message.guild.channels.cache.get(
          classRegisterChannelId
        )}.`
      );

      // update classes JSON
      setClassData(classCategories);
    } catch (error) {
      // Pass off error to the parent after remove anything created
      if (classRole) {
        classRole.delete().then(() => console.log(`Error creating class, deleted role ${className}`));
      }
      if (classChannel) {
        classChannel.delete().then(() => console.log(`Error creating class, deleted channel ${className}`));
      }
      if (joinMessage) {
        joinMessage.delete().then(() => console.log(`Error creating class, deleted channel ${className}`));
      }
      throw(error);
    }
  },
};
