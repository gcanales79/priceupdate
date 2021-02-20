var db = require("../models");
var isAuthenticated = require("../config/middleware/isAuthenticated");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = function (app) {
  app.get("/", isAuthenticated, function (req, res) {
    const { role, id } = req.user;
    db.Vendor.findAll({
      include: [db.User, db.Item],
      where: {
        UserId: id,
      },
    }).then((data) => {
      let items=[]
      for (let i = 0; i < data.length; i++) {
        for(let j=0; j < data[i].Items.length; j++) {
        items.push(data[i].Items[j].item_no)
        }
      }
      console.log(items)
      //res.json(items)
      if (role === "user") {
        res.render("index", {
          jsfile: "index.js",
          user: true,
          items:items,
        });
      } else if (role === "admin") {
        res.redirect("/admin");
      } else {
        res.render("404");
      }
    }); 
  });

  //Update Price by User
  app.get("/user/update-price",isAuthenticated,(req,res)=>{
    const { role, id } = req.user;
    if (role === "user") {
      res.render("userPrice", {
        jsfile: "userPrice.js",
        user: true,
      });
    } else if (role === "admin") {
      res.redirect("/admin");
    } else {
      res.render("404");
    }
  })

  //Login Page
  app.get("/login", (req, res) => {
    res.render("login", {
      style: "login.css",
      title: "Sign in",
      title2: "Sign up",
      link: "/signup",
      buttonTitle: "Login",
      jsfile: "login.js",
    });
  });

  //Signup Page
  app.get("/signup", (req, res) => {
    res.render("signup", {
      style: "login.css",
      title: "Sign up",
      title2: "Sign in",
      link: "/login",
      buttonTitle: "Signup",
      jsfile: "signup.js",
    });
  });

  //Admin Homepage
  app.get("/admin", isAuthenticated, (req, res) => {
    const { role } = req.user;
    if (role === "user") {
      res.redirect("/");
    } else if (role === "admin") {
      res.render("admin", {
        admin: true,
        homeAdmin: true,
        jsfile: "admin.js",
      });
    }
  });

  //Admin Users Homepage
  app.get("/admin/users", isAuthenticated, (req, res) => {
    const { role } = req.user;
    if (role === "user") {
      res.redirect("/");
    } else if (role === "admin") {
      res.render("usersAdmin", {
        admin: true,
        userAdmin: true,
        jsfile: "userAdmin.js",
      });
    }
  });

  //404 Not Found
  app.get("*", function (req, res) {
    res.render("404");
  });
};
