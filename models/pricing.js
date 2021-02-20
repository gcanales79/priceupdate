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
      comments: {
        type: DataTypes.TEXT,
      },
      currency: {
        type: DataTypes.STRING,
      },
      unit_measure: {
        type: DataTypes.STRING,
      },
      confirmed:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
      }
     
    });
  
 
     
  
  
     return Pricing;
  };