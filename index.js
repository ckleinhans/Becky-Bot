// Establish all dependencies
const Discord = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const db = require("quick.db");

// Create the client and player objects, as well as create collections for cooldown tracking
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();

// Get client variable in other files
module.exports.client = client;

// Load the classes from classes.json
let classData;
console.log("Loading classes file...");
const data = fs.readFileSync("./classes.json");
try {
  classData = JSON.parse(data);
} catch (err) {
  console.log("ERROR PARSING classes.json");
  console.log(err);
}

// Lets other files access classData variable
module.exports.getClassData = () => {
  return classData;
};

// lets other files write and save classData
module.exports.setClassData = (data) => {
  classData = data;
  const output = JSON.stringify(data);
  fs.writeFile("./classes.json", output, (error) => {
    if (error) {
      this.handleError(error);
    } else {
      console.log("classes.json file written.");
    }
  });
};

// called on errors to send a dm to the developer listed in the config
module.exports.handleError = async (error) => {
  console.log(error);
  const developer = await client.users.fetch(config.developerId);
  developer.send(error.toString());
};

module.exports.findClass = (lookupVar, propertyName) => {
  for (let i = 0; i < classData.length; i++) {
    const foundClass = classData[i].classes.find(
      (foundClass) => foundClass[propertyName] == lookupVar
    );
    if (foundClass) {
      return foundClass;
    }
  }
};

module.exports.cooldownCheck = (collectionName, userId, cooldownAmount) => {
  // Check if cooldown collection exists, if not add it
  if (!cooldowns.has(collectionName)) {
    cooldowns.set(collectionName, new Discord.Collection());
  }
  const now = Date.now();
  const timestamps = cooldowns.get(collectionName);
  cooldownAmount = cooldownAmount * 1000;

  // If author exists in cooldown collection, check if they have to wait to call command again
  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownAmount;
    // if user has more time to wait, return the time left
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return timeLeft;
    }
  }
  // If author wasn't in the collection add them with new timestamp
  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
  // null means user is good to go
  return null;
};

module.exports.handleRankingSystem = async (message) => {
  const { messageCooldown, dailyExperienceLimit } = config.experienceRules;
  // Checks if user has sent message recently, prevents members from spamming to get exp
  if (!this.cooldownCheck("messageCount", message.author.id, messageCooldown)) {
    // Checks if user has sent a message in the past 24 hours
    if (
      this.cooldownCheck("dailyMessageLimit", message.author.id, 60 * 60 * 24)
    ) {
      // If yes, checks the messages they have sent today
      if (
        Number(db.get(`${message.author.id}.dailyMessages`)) <=
        dailyExperienceLimit
      ) {
        // Only increments experience if they have less than the max per day
        db.add(`${message.author.id}.dailyMessages`, 1);
        db.add(`${message.author.id}.messageCount`, 1);
      }
    } else {
      // If user hasn't sent message in 24 hours, resets daily messages and increments exp
      db.set(`${message.author.id}.dailyMessages`, 1);
      db.add(`${message.author.id}.messageCount`, 1);
    }
  }

  // If user is bot don't try to rank up
  if (message.author.bot) return;

  // Check if user needs a role upgrade
  const messageCount = db.get(`${message.author.id}.messageCount`) || 0;
  let levelIndex = db.get(`${message.author.id}.levelIndex`);
  if (levelIndex === undefined) {
    levelIndex = -1;
  }
  // If there is a level above user current level and if they have sent enough messages
  if (config.levels[levelIndex + 1]) {
    if (messageCount >= config.levels[levelIndex + 1].messageCount) {
      // Get next role and add to user
      message.guild.roles
        .fetch(config.levels[levelIndex + 1].roleId)
        .then((role) => {
          message.guild.member(message.author).roles.add(role);
          console.log(`Added ${message.author.tag} to ${role.name}`);
          // If there is a level below, remove it from the user.
          if (levelIndex >= 0) {
            message.guild
              .member(message.author)
              .roles.remove(config.levels[levelIndex].roleId);
            console.log(`Removed ${message.author.tag} from previous role`);
          }
          // Update database with new user level and send level up message to bot channel
          db.set(`${message.author.id}.levelIndex`, levelIndex + 1);
          message.guild.channels
            .resolve(config.botChannelId)
            .send(`${message.author} just leveled up to ${role.name}!`);
        })
        .catch((error) => this.handleError(error));
    }
  }
};

// Handles checking if messages need to be pinned/unpinned and performing necessary action
module.exports.handlePin = async (oldMessage, newMessage) => {
  // If new message exists, contains #pin, is in a class chat and oldMessage does not exist or have #pin, pin it to the channel
  if (newMessage && newMessage.content) {
    if (
      newMessage.content.includes("#pin") &&
      (!oldMessage ||
        !oldMessage.content ||
        !oldMessage.content.includes("#pin"))
    ) {
      if (
        classData.find(
          (category) => category.categoryId == newMessage.channel.parentID
        )
      ) {
        newMessage.pin({ reason: "message included #pin" });
        console.log(
          `Pinning message from ${newMessage.author.tag} in ${newMessage.channel.name}`
        );
      }
    } else if (
      !newMessage.content.includes("#pin") &&
      oldMessage &&
      oldMessage.content.includes("#pin")
    ) {
      if (
        classData.find(
          (category) => category.categoryId == newMessage.channel.parentID
        )
      ) {
        newMessage.unpin({
          reason: "message edited to no longer include #pin",
        });
        console.log(
          `Unpinning message from ${newMessage.author.tag} in ${newMessage.channel.name}`
        );
      }
    }
  }
};

// Handles pranking the user
module.exports.handlePrank = async (message) => {
  const emoji =
    config.prankEmojis[Math.floor(Math.random() * config.prankEmojis.length)];
  message.react(emoji);
  console.log(`Pranked ${message.author.tag} with random emoji`);
};

module.exports.checkPermission = (command, member) => {
  if (command.adminOnly) {
    if (message.member.roles.cache.has(config.adminRoleId)) return true;
    else return false;
  }
  if (command.roleLocked) {
    if (
      message.member.roles.cache.has(config.adminRoleId) ||
      message.member.roles.cache.has(config.commandRoleId)
    )
      return true;
    else return false;
  }
  return true;
};

// Get all .js files in commands folder and load them as commands
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// On bot startup
client.once("ready", () => {
  console.log("Ready!");
  client.user.setPresence({
    status: "online",
    activity: {
      name: "Canvas",
      type: "PLAYING",
    },
  });
});

client.on("message", (message) => {
  // Add one to user's message count if sent in a server
  if (message.channel.type !== "dm") {
    this.handleRankingSystem(message);
    // Also handle prank if user has role
    if (message.member.roles.cache.has(config.prankRoleId)) {
      this.handlePrank(message);
    }
  }

  // Filter out messages that don't begin with the prefix or that are from the bot
  if (!message.content.startsWith(config.prefix) || message.author.bot) {
    return this.handlePin(null, message);
  }

  // Parses message for space seperated tokens
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Check for command with given name or alias for a command with given name
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );
  if (!command) {
    console.log(`Command ${commandName} is unrecognized`);
    return;
  }

  // Checks if command is server only, if so and is in dm sends error message (adminOnly commands can only be executed in server)
  if (
    (command.serverOnly || command.adminOnly || command.permissionLocked) &&
    message.channel.type === "dm"
  ) {
    return message.channel.send("I can't execute that command inside DMs!");
  }

  // Checks if user has role for using the command.
  if (
    message.channel.type !== "dm" &&
    this.checkPermission(command, message.member)
  ) {
    return message.channel.send(
      "Looks like you don't have permission to use that."
    );
  }

  // Check if command being called with correct number of args
  if (command.args && !args.length) {
    let ret = `Improper usage of ${command.name}. `;
    if (command.usage)
      ret += `Usage: ${config.prefix}${command.name} ${command.usage}`;
    return message.channel.send(ret);
  }

  // Check if user can call command or if on cooldown
  const timeLeft = this.cooldownCheck(
    command.name,
    message.author.id,
    command.cooldown || config.defaultCooldown
  );
  if (timeLeft) {
    // user still has to wait
    return message.channel.send(
      `Woah there! You gotta wait ${timeLeft.toFixed(
        1
      )} more second(s) before using \`${command.name}\` again.`
    );
  }

  // Try to execute command
  try {
    console.log(
      `${message.author.tag} executing ${command.name} from channel ${message.channel.name}`
    );
    command.execute(message, args);
  } catch (error) {
    this.handleError(error);
    message.channel.send(
      `Uh oh an error occurred. <@&${config.supportRoleId}> has been notified and will try to fix the issue.`
    );
  }
});

client.on("messageUpdate", (oldMessage, newMessage) => {
  // When a message is updated (edited) check if it needs to get pinned or unpinned
  this.handlePin(oldMessage, newMessage);
});

client.on("messageReactionAdd", async (reaction, user) => {
  // Check if the reaction added by a user to the class channel and if so gives them the class role
  if (
    user &&
    !user.bot &&
    reaction.emoji.toString() == config.joinClassEmoji &&
    reaction.message.channel.id == config.classRegisterChannelId
  ) {
    const messageClass = this.findClass(reaction.message.id, "messageId");
    if (messageClass) {
      reaction.message.guild.roles
        .fetch(messageClass.roleId)
        .then((role) => {
          reaction.message.guild.member(user).roles.add(role);
          console.log(`Added ${user.tag} to ${role.name}`);
        })
        .catch((error) => this.handleError(error));
      return;
    }
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  // Check if the reaction removed by a user to the class channel and if so removes the class role from them
  if (
    user &&
    !user.bot &&
    reaction.emoji.toString() == config.joinClassEmoji &&
    reaction.message.channel.id == config.classRegisterChannelId
  ) {
    const messageClass = this.findClass(reaction.message.id, "messageId");
    if (messageClass) {
      reaction.message.guild.roles
        .fetch(messageClass.roleId)
        .then((role) => {
          reaction.message.guild.member(user).roles.remove(role);
          console.log(`Removed ${user.tag} from ${role.name}`);
        })
        .catch((error) => this.handleError(error));
      return;
    }
  }
});

// Sends welcome message on new user join
client.on("guildMemberAdd", (member) => {
  const classChannel = member.guild.channels.cache.get(
    config.classRegisterChannelId
  );
  member.guild.channels.cache
    .get(config.welcomeChannelId)
    .send(
      `**Welcome to UW Madison Online ${member}!**\n\n` +
        `When you're ready to get started, head over to ${classChannel} to join the classes you are a part of.\n\n` +
        "On Wisconsin!"
    );
  console.log(`${member.tag} joined the server`);
});

// Login to Discord
client.login(config.token);
