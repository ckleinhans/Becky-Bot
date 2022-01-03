const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");
const { Classes } = require("../dbObjects.js");
const { departments } = require("../departments.json");
const {
  classCreateChannelId,
  classJoinChannelId,
  classJoinEmoji,
  guildInviteLink,
} = require("../config.json");

/*
Command to create a new class with a channel and role.
*/

module.exports = {
  global: false,
  data: new SlashCommandBuilder()
    .setName("createclass")
    .setDescription("Creates a class with a given department and number.")
    .addStringOption((option) =>
      option
        .setName("department")
        .setDescription(
          "Department code of the class. See all departments by using /departments."
        )
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("Course number. Must be in range of 1 to 799.")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.channel.id !== classCreateChannelId) {
      const createChannel = await interaction.guild.channels.fetch(
        classCreateChannelId
      );
      return await interaction.reply({
        content: `You can only create classes in ${createChannel}.`,
        ephemeral: true,
      });
    }
    const department = interaction.options.getString("department");
    const number = interaction.options.getInteger("number");

    // Check department is valid
    if (!departments.includes(department)) {
      return await interaction.reply({
        content: `${department} is not a valid department code. Use /departments to get a list of all valid codes.`,
        ephemeral: true,
      });
    }

    // Check course number is valid
    if (number < 100 || number > 799) {
      return await interaction.reply({
        content: `Course numbers must be between 100 and 799`,
        ephemeral: true,
      });
    }

    const name = `${department}-${number}`;

    const classJoinChannel = await interaction.guild.channels.fetch(
      classJoinChannelId
    );

    const { classData, categoryData } = interaction.client;

    const oldClassObj = classData.get(name);

    // If class already exists, return message that has link to join message
    if (oldClassObj) {
      const classMsg = await classJoinChannel.messages.fetch(
        oldClassObj.messageId
      );
      const embed = new MessageEmbed()
        .setColor("#ff0000")
        .setTitle(`Join ${oldClassObj.name} here!`)
        .setURL(classMsg.url)
        .setAuthor(`Class has already been created!`);

      return await interaction.reply({ embeds: [embed] });
    }

    const newClassObj = { name, numMessages: 0 };

    // Try to create class role
    try {
      const classRole = await interaction.guild.roles.create({
        name: name,
        mentionable: true,
        reason: `${interaction.user.tag} created class ${name}`,
      });
      newClassObj.roleId = classRole.id;
      console.log(
        `Created role for class ${name} requested by ${interaction.user.tag}`
      );
    } catch (error) {
      return await interaction.client.handleError(
        `Error when creating role for class ${name} requested by ${interaction.user.tag}`,
        error,
        interaction
      );
    }

    // find class category with space for new class
    newClassObj.categoryId = categoryData.find(
      (category) => category.numClasses < 50
    )?.id;

    // if no category found, create new one
    if (!newClassObj.categoryId) {
      try {
        const category = await interaction.guild.channels.create("My Classes", {
          type: "GUILD_CATEGORY",
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone.id,
              deny: [Permissions.FLAGS.VIEW_CHANNEL],
            },
          ],
        });
        // save new category to the db and categoryData collection with helper function
        await interaction.client.categoryData.addClass(category.id, 0);
        newClassObj.categoryId = category.id;
        console.log(`Class categories full. Created new category.`);
      } catch (error) {
        return await interaction.client.handleError(
          `Error while creating new class category for class ${name} requested by ${interaction.user.tag}`,
          error,
          interaction
        );
      }
    }

    // Try to create channel
    try {
      const classChannel = await interaction.guild.channels.create(name, {
        type: "GUILD_TEXT",
        parent: newClassObj.categoryId,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
          },
          {
            id: newClassObj.roleId,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
          },
        ],
      });
      newClassObj.channelId = classChannel.id;

      // Increment number of classes in category
      categoryData.addClass(newClassObj.categoryId, 1);

      // Send class welcome message
      classChannel.send(
        `Welcome to <@&${newClassObj.roleId}>!\n\n` +
          `You can tag <@&${newClassObj.roleId}> in any message to notify all members of this channel.\n\n` +
          `To pin messages in this channel, just include #pin somewhere in your message.\n\n` +
          `To get the most out of this class channel, make sure to invite as many ` +
          `classmates as you can to get the conversation started as soon as possible!\n\n` +
          `You can use this link to invite others to the server: ${guildInviteLink}`
      );
      console.log(`Created channel and sent welcome message for class ${name}`);
    } catch (error) {
      return await interaction.client.handleError(
        `Error while creating new class channel & sending welcome message for class ${name} requested by ${interaction.user.tag}`,
        error,
        interaction
      );
    }

    // Try to create join message
    let joinMessage;
    try {
      joinMessage = await classJoinChannel.send(name);
      await joinMessage.react(classJoinEmoji);
      newClassObj.messageId = joinMessage.id;
      console.log(`Sent message and reaction for ${name}`);
    } catch (error) {
      return await interaction.client.handleError(
        `Error while sending join message for class ${name} requested by ${interaction.user.tag}`,
        error,
        interaction
      );
    }

    // Add class object to db and classData collection
    const newClass = await Classes.create(newClassObj);
    interaction.client.classData.set(newClass.name, newClass);

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setTitle(`Join ${newClass.name} here!`)
      .setURL(joinMessage.url)
      .setAuthor(
        `${interaction.user.username}'s class creation`,
        interaction.user.avatarURL()
      );

    await interaction.reply({ embeds: [embed] });
  },
};
