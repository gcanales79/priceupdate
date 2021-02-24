const bcrypt = require("bcrypt");
const saltRounds = 10;

// Creating our User model
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    // The email cannot be null, and must be a proper email before creation
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    // The password cannot be null
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:"user"
    },
    active:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    resetPasswordToken:{
      type:DataTypes.STRING,
    },
    resetPasswordExpire:{
      type:DataTypes.DATE
    }
  });

    // Creating a custom method for our User model. This will check if an unhashed password entered by the user can be compared to the hashed password stored in our database
    User.prototype.validPassword = function(password) {
      return bcrypt.compare(password, this.password);
    };
    // Hooks are automatic methods that run during various phases of the User Model lifecycle
    // In this case, before a User is created, we will automatically hash their password
    
    User.addHook("beforeCreate", function(user) {
      console.log("Before Create")
      user.password = bcrypt.hashSync(user.password, saltRounds, null);
    });
  
    User.addHook("beforeUpdate", function(user) {
      console.log("before update")
      user.password = bcrypt.hashSync(user.password, saltRounds, null);
    });

    User.associate=function(models){
      User.hasMany(models.Vendor,{
        foreignKey:"UserId"
      })
      
      User.hasMany(models.File,{
        foreignKey: "UserId"
      })
  }


   return User;
};