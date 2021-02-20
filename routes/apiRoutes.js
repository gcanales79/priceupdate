require("dotenv").config();
var db = require("../models");
const { check, validationResult } = require("express-validator");
var passport = require("../config/passport");
var isAuthenticated = require("../config/middleware/isAuthenticated");
var isAuthenticatedAdmin = require("../config/middleware/isAuthenticatedAdmin");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment-timezone');

module.exports = function (app) {
  //User Signup
  app.post(
    "/signup",
    check("email").isEmail().withMessage("Not a valid email address"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("The password must have at least 5 characters"),
    (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        let errores = errors.array();
        return res.send({
          message: errores[0].msg,
          alert: "Error",
        });
      }

      const { email, password, role } = req.body;

      db.User.create({
        email: email.toLowerCase(),
        password: password,
        role: role,
      })
        .then((data) => {
          if (!data) {
            res.send({
              message: "Error while creating the user",
              alert: "Error",
            });
          } else {
            res.send({
              message: "User signup correctly",
              alert: "Success",
            });
          }
        })
        .catch((err) => {
          //console.log(err)
          res.send({
            message: "The user already exists",
            alert: "Error",
          });
        });
    }
  );

  //Login
  app.get("/signin", function (req, res, next) {
    passport.authenticate("local", function (err, user, info) {
      if (err) {
        res.send({ message: "Error de servidor", alert: "Error" });
      }
      if (!user) {
        res.send({ message: info.message, alert: "Error" });
      }
      req.logIn(user, function (err) {
        if (err) {
          res.send({
            message: "Error de servidor",
            alert: "Error",
          });
        }
        res.send({
          message: "Usuario correcto",
          alert: "Success",
          user_role: user.role,
          user_id:user.id
        });
      });
    })(req, res, next);
  });

  //Logout
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  //Get all users
  app.get("/get-all-users", isAuthenticatedAdmin, (req, res) => {
    db.User.findAll({
      where: {
        role: "user",
      },
      include: [db.Vendor],
    })
      .then((userStored) => {
        if (!userStored) {
          res.send({ message: "Not user found", alert: "Error" });
        } else {
          res.send({
            message: "User found successfully",
            alert: "Success",
            user: userStored,
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Server error", alert: "Error", err: err });
      });
  });

  //Update user by id
  app.put("/update-user/:id", isAuthenticatedAdmin, (req, res) => {
    const { active } = req.body;
    const { id } = req.params;
    db.User.update(
      {
        active: active,
      },
      {
        where: {
          id: id,
        },
      }
    )
      .then((updateUser) => {
        if (updateUser[0] === 0) {
          res.send({ message: "Not user found", alert: "Error" });
        } else {
          res.send({ message: "User updated", alert: "Success" });
        }
      })
      .catch((err) => {
        res.send({ message: "Server error", alert: "Error", err: err });
      });
  });

  //Delete user by id
  app.delete("/delete-user/:id", isAuthenticatedAdmin, (req, res) => {
    const { id } = req.params;
    db.User.destroy({
      where: {
        id: id,
      },
    })
      .then((userDelete) => {
        if (!userDelete) {
          res.send({ message: "User not deleted", alert: "Error" });
        } else {
          res.send({ message: "User deleted", alert: "Success" });
        }
      })
      .catch((err) => {
        res.send({ message: "Server error", alert: "Error", err: err });
      });
  });

  //Get all vendors
  app.get("/get-all-vendors", isAuthenticatedAdmin, (req, res) => {
    db.Vendor.findAll({
      order: [["vendor_no", "ASC"]],
    })
      .then((vendorStored) => {
        if (!vendorStored) {
          res.send({ message: "No vendors found", alert: "Error" });
        } else {
          res.send({
            message: "Vendor found",
            alert: "Success",
            data: vendorStored,
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Server error", alert: "Error", err: err });
      });
  });

  //Add user to Vendor
  app.put(
    "/add-user-to-vendor/:vendor_no",
    isAuthenticatedAdmin,
    (req, res) => {
      const { UserId } = req.body;
      const { vendor_no } = req.params;
      db.Vendor.update(
        {
          UserId: UserId,
        },
        {
          where: {
            vendor_no: vendor_no,
          },
        }
      )
        .then((updateVendor) => {
          if (updateVendor[0] === 0) {
            res.send({ message: "Not vendor found", alert: "Error" });
          } else {
            res.send({ message: "Vendor updated", alert: "Success" });
          }
        })
        .catch((err) => {
          res.send({ message: "Server error", alert: "Error", err: err });
        });
    }
  );

  //Get Items by User
  app.get("/get-items/:user",isAuthenticated, (req, res) => {
    const { user } = req.params;
    db.Vendor.findAll({
      include: [db.User, db.Item],
      where: {
        UserId: user,
      },
    }).then((data) => {
      let items=[]
      for (let i = 0; i < data.length; i++) {
        for(let j=0; j < data[i].Items.length; j++) {
        items.push(data[i].Items[j].item_no)
        }
      }
      res.json(items)
      
    }).catch((err)=>{
      console.log(err)
    });
  });

  //Get Item princing
  app.get("/get-pricing/:item_no",(req,res)=>{
    const {item_no}=req.params;
    db.Pricing.findAll({
      where:{
        item_no:item_no,
      },
      order:[["starting_date","DESC"]]
    }).then((data)=>{
      res.json(data)
    }).catch((err)=>{
      console.log(err)
    })
  })
};
