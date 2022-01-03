const Sequelize = require("sequelize");
const fs = require("fs");

// Define database connection
const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "database.sqlite",
});

// Create tables in database for models
const Shop = require("./models/Shop.js")(sequelize, Sequelize.DataTypes);
const Users = require("./models/Users.js")(sequelize, Sequelize.DataTypes);
require("./models/UserItems.js")(sequelize, Sequelize.DataTypes);
require("./models/Classes.js")(sequelize, Sequelize.DataTypes);
require("./models/Categories.js")(sequelize, Sequelize.DataTypes);

// Run script with force flag to force database sync (this removes/replaces all entries in database)
const force = process.argv.includes("--force") || process.argv.includes("-f");

const shopFiles = fs
  .readdirSync("./shop")
  .filter((file) => file.endsWith(".js"));
const shopItems = shopFiles.map((file) => require(`./shop/${file}`));

// Sync database and define shop items
sequelize
  .sync({ force })
  .then(async () => {
    // Define items in shop and respective costs from files
    const shop = shopItems.map((item) => Shop.upsert(item.data));

    // If user import flag, import users from users.json file exported from old Becky Bot version
    let users = [];
    if (process.argv.includes("--users") || process.argv.includes("-u")) {
      const userData = require("./users.json");
      users = userData.map((data) =>
        Users.upsert({
          user_id: data.ID,
          balance: 0,
          experience: data.data.messageCount ?? 0,
          rank: data.data.levelIndex ? data.data.levelIndex + 1 : 0,
          lastMessage: new Date().setHours(0, 0, 0, 0),
          dailyMessages: 0,
        })
      );
    }

    await Promise.all([...shop, ...users]);
    console.log("Database synced");

    sequelize.close();
  })
  .catch(console.error);
