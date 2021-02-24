// Creating our Vendor model
module.exports = function(sequelize, DataTypes) {
  var Vendor = sequelize.define("Vendor", {
    vendor_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
   
  });

  Vendor.associate = function (models) {
    Vendor.belongsTo(models.User, {
      foreignKey: "UserId",
    });
    Vendor.hasMany(models.Item,{
        foreignKey: {
            
        }
    }),
    Vendor.belongsTo(models.File,{
      foreignKey: "UserId"
    })

  };

   


   return Vendor;
};