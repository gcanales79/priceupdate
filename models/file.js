// Creating our Pricing model
module.exports = function (sequelize, DataTypes) {
  var File = sequelize.define("File", {
    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Submitted",
    },
    comments: {
      type: DataTypes.TEXT,
    },
  });

  File.associate = function (models) {
    File.belongsTo(models.User, {
      foreignKey: {},
    });
  };

  return File;
};
