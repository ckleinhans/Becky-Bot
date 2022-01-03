const Sequelize = require("sequelize");

// Define database connection
const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "database.sqlite",
});

// Define models
const Users = require("./models/Users.js")(sequelize, Sequelize.DataTypes);
const Shop = require("./models/Shop.js")(sequelize, Sequelize.DataTypes);
const UserItems = require("./models/UserItems.js")(
  sequelize,
  Sequelize.DataTypes
);
const Classes = require("./models/Classes.js")(sequelize, Sequelize.DataTypes);
const Categories = require("./models/Categories.js")(
  sequelize,
  Sequelize.DataTypes
);

UserItems.belongsTo(Shop, { foreignKey: "item_id", as: "item" });

Reflect.defineProperty(Users.prototype, "addItems", {
  value: async function addItems(item, amount) {
    const userItem = await UserItems.findOne({
      where: { user_id: this.user_id, item_id: item.id },
    });

    if (userItem) {
      userItem.amount += amount;
      return userItem.save();
    }

    return UserItems.create({
      user_id: this.user_id,
      item_id: item.id,
      amount: amount,
    });
  },
});

Reflect.defineProperty(Users.prototype, "getItems", {
  value: function getItems() {
    return UserItems.findAll({
      where: { user_id: this.user_id },
      include: ["item"],
    });
  },
});

module.exports = { Users, Shop, UserItems, Classes, Categories };
