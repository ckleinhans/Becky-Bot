module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "classes",
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      channelId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      messageId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      roleId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      numMessages: {
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
