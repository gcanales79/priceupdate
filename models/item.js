// Creating our Item model
module.exports = function(sequelize, DataTypes) {
    var Item = sequelize.define("Item", {
      item_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    })
  
    Item.associate = function (models) {
      Item.belongsTo(models.Vendor, {
        foreignKey: {
            allowNull: false
        },
      });
    };
  
     
  
  
     return Item;
  };