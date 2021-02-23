// Creating our Pricing model
module.exports = function(sequelize, DataTypes) {
    var Pricing = sequelize.define("Pricing", {
      item_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      starting_date: {
        type: DataTypes.DATE,
       
      },
      ending_date: {
        type: DataTypes.DATE,
       
      },
      base_price: {
        type: DataTypes.DECIMAL(10,5) ,
        
      },
      surcharge: {
        type: DataTypes.DECIMAL(10,5),
      },
      confirmed:{
        type:DataTypes.STRING,
        defaultValue:"Submitted",
      },
      comments: {
        type: DataTypes.TEXT,
      },
      
     
    });
  
    Pricing.associate = function (models) {
      Pricing.belongsTo(models.Item, {
        foreignKey: {
  
        },
      });
      
  
    };
 
     
  
  
     return Pricing;
  };