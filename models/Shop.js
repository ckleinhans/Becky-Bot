module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "shop",
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
