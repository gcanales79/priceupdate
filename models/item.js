// Creating our Item model
module.exports = function (sequelize, DataTypes) {
  var Item = sequelize.define("Item", {
    item_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit_measure: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Item.associate = function (models) {
    Item.belongsTo(models.Vendor, {
      foreignKey: {
        allowNull: false,
      },
    });

    Item.hasMany(models.Pricing, {
      foreignKey: {},
    });
  };

  return Item;
};
