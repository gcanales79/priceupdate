var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var db = require("../models");

// Telling passport we want to use a Local Strategy. In other words, we want login with a username/email and password
passport.use(
  new LocalStrategy(
    // Our user will sign in using an email, rather than a "username"
    {
      usernameField: "email",
    },
    function (email, password, done) {
      // When a user tries to sign in this code runs
      db.User.findOne({
        where: {
          email: email,
        },
      }).then(async function (dbUser, err) {
        //console.log(dbUser)

        //Tiene que hacerse asyncrono para que evalue el password
        //console.log(await dbUser.validPassword(password))

        // If there's no user with the given email
        if (err) throw err;
        if (!dbUser) {
          return done(null, false, {
            message: "Not a valid user of the system",
          });
        }
        // If there is a user with the given email, but the password the user gives us is incorrect
        else if (!(await dbUser.validPassword(password))) {
          return done(null, false, {
            message: "Incorrect password",
          });
        } else if (!dbUser.active) {
          return done(null, false, {
            message: "Not an active user",
          });
        }
        // If none of the above, return the user
        return done(null, dbUser);
      });
    }
  )
);

// In order to help keep authentication state across HTTP requests,
// Sequelize needs to serialize and deserialize the user
// Just consider this part boilerplate needed to make it all work
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Exporting our configured passport
module.exports = passport;