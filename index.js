const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { Users, Categories, Classes } = require("./dbObjects.js");
const {
  dailyExperienceLimit,
  developerId,
  token,
  ranks,
} = require("./config.json");

// Create client object
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  // Use partials to allow events involving un-cached messages
  // Must fetch objects before performing actions on them
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

// Define collections for holding userData, classData and commands
client.userData = new Collection();
client.classData = new Collection();
client.categoryData = new Collection();
client.commands = new Collection();

// Get list of all command files from commands directory
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

// Load all commands into command collection
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Create new item in collection with key = command name, value = exported module
  client.commands.set(command.data.name, command);
}

// Get list of all event handler files from events directory
const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

// Set up client event handlers using list of files from events directory.
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  // Allows client to listen for event once or multiple times depending on once flag.
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Save store items as property of client using item name as key
// TODO, might only need to store use functions, but for now store all just in case
client.shopItems = {};
const shopFiles = fs
  .readdirSync("./shop")
  .filter((file) => file.endsWith(".js"));
shopFiles.forEach((file) => {
  const item = require(`./shop/${file}`);
  client.shopItems[item.data.name] = item;
});

/*
Define helper functions
*/

// Create helper function for errors to display a message to console & report to dev
Reflect.defineProperty(client, "handleError", {
  value: async function handleError(message, error, interaction) {
    console.error(message, error);
    const dev = await client.users.fetch(developerId);
    dev.send(`${message}\n${error}`);
    if (interaction) {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
});

// Define helper function to check user rank as property of client
Reflect.defineProperty(client, "checkRank", {
  value: async function checkRank(member) {
    // Get user data. If doesn't exist, create new user data
    let user = client.userData.get(member.id);
    if (!user) {
      user = await Users.create({
        user_id: member.id,
        balance: 0,
        experience: 0,
        rank: 0,
        lastMessage: new Date().setHours(0, 0, 0, 0),
        dailyMessages: 0,
      });
      client.userData.set(member.id, user);
      return false; // didn't update user's rank
    }

    // Check if exceeding current max experience or below current min experience
    const currRank = ranks[user.rank];
    if (
      (currRank.maxExperience && user.experience > currRank.maxExperience) ||
      (currRank.minExperience && user.experience < currRank.minExperience)
    ) {
      // Get rank user should be moved to & update rank property
      const newRank = ranks.find((r, index) => {
        if (!r.maxExperience || r.maxExperience > user.experience) {
          user.rank = index;
          user.save();
          return true;
        }
        return false;
      });

      // Add user to new role if it exists
      if (newRank.roleId) {
        await member.roles.add(
          newRank.roleId,
          `User's experience ${user.experience} within role's range ${currRank.minExperience}-${currRank.maxExperience}`
        );
      }

      // Remove user from old role if it exists
      if (currRank.roleId) {
        await member.roles.remove(
          currRank.roleId,
          `User's experience ${user.experience} no longer in role's range ${currRank.minExperience}-${currRank.maxExperience}`
        );
      }

      console.log(`Updated rank of ${member.user.tag} to rank ${newRank.name}`);
      return true; // updated user rank
    }
    return false; // didn't update user rank
  },
});

// Define helper function to add money as property of userData collection
Reflect.defineProperty(client.userData, "addBalance", {
  value: async function addCurrency(id, amount) {
    const user = client.userData.get(id);

    if (user) {
      user.balance += Number(amount);
      return user.save();
    }

    const newUser = await Users.create({
      user_id: id,
      balance: amount,
      experience: 0,
      rank: 0,
      lastMessage: new Date().setHours(0, 0, 0, 0),
      dailyMessages: 0,
    });
    client.userData.set(id, newUser);

    return newUser;
  },
});

// Define helper function to add experience as property of userData collection
Reflect.defineProperty(client.userData, "addExperience", {
  value: async function addCurrency(id, amount) {
    const user = client.userData.get(id);

    if (user) {
      user.experience += Number(amount);
      return user.save();
    }

    const newUser = await Users.create({
      user_id: id,
      balance: 0,
      experience: amount,
      rank: 0,
      lastMessage: new Date().setHours(0, 0, 0, 0),
      dailyMessages: 0,
    });
    client.userData.set(id, newUser);

    return newUser;
  },
});

// Define helper function to get a user's balance as property of userData collection
Reflect.defineProperty(client.userData, "getBalance", {
  value: function getBalance(id) {
    const user = client.userData.get(id);
    return user ? user.balance : 0;
  },
});

// Define helper function to get a user's experience as property of userData collection
Reflect.defineProperty(client.userData, "getExperience", {
  value: function getExperience(id) {
    const user = client.userData.get(id);
    return user ? user.experience : 0;
  },
});

// Define helper function to record sent messages & give experience
Reflect.defineProperty(client.userData, "messageSent", {
  value: async function messageSent(id) {
    const user = client.userData.get(id);
    const currDate = new Date().setHours(0, 0, 0, 0);

    if (user) {
      if (user.lastMessage < currDate) {
        user.dailyMessages = 0;
      }
      if (user.dailyMessages < dailyExperienceLimit) {
        user.experience += 1;
      }
      user.dailyMessages += 1;
      user.lastMessage = currDate;
      return user.save();
    }

    const newUser = await Users.create({
      user_id: id,
      balance: 0,
      experience: 1,
      rank: 0,
      lastMessage: currDate,
      dailyMessages: 1,
    });
    client.userData.set(id, newUser);

    return newUser;
  },
});

// Define helper function to add/remove classes to a class channel category
Reflect.defineProperty(client.categoryData, "addClass", {
  value: async function addClass(id, amount) {
    const category = client.categoryData.get(id);

    if (category) {
      category.numClasses += Number(amount);
      return category.save();
    }

    const newCategory = await Categories.create({
      id: id,
      numClasses: amount,
    });
    client.categoryData.set(id, newCategory);

    return newCategory;
  },
});

// Define helper function to add/remove classes to a class channel category
Reflect.defineProperty(client.classData, "addMessage", {
  value: async function addMessage(name, amount) {
    const classObj = client.classData.get(name);

    classObj.numMessages += Number(amount);
    return classObj.save();
  },
});

// Define helper function to delete classes from classData
Reflect.defineProperty(client.classData, "deleteClass", {
  value: async function deleteClass(name) {
    await Classes.destroy({ where: { name } });
    client.classData.delete(name);
  },
});

// Go online
client.login(token);
