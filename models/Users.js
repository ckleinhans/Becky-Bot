module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "users",
    {
      user_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      balance: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      experience: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      rank: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      lastMessage: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dailyMessages: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
