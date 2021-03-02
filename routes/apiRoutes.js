require("dotenv").config();
var db = require("../models");
const { check, validationResult } = require("express-validator");
var passport = require("../config/passport");
var isAuthenticated = require("../config/middleware/isAuthenticated");
var isAuthenticatedAdmin = require("../config/middleware/isAuthenticatedAdmin");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment-timezone");
var fs = require("fs");
var multer = require("multer");
var upload = multer({ dest: "./priceFiles" });
const readXlsxFile = require("read-excel-file/node");
const crypto = require("crypto");
var async = require("async");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
      async.waterfall(
        [
          function (done) {
            //console.log("entro 1")
            crypto.randomBytes(20, function (err, buf) {
              var token = buf.toString("hex");
              //console.log("El token es " + token)
              done(err, token);
            });
          },
          function (token, done) {
            db.User.create({
              email: email.toLowerCase(),
              password: password,
              role: role,
              resetPasswordToken: token,
              resetPasswordExpire: Date.now() + 7200000, //2 horas
            })
              .then((data, err) => {
                console.log(err);
                if (!data) {
                  res.send({
                    message: "Error while creating the user",
                    alert: "Error",
                  });
                } else {
                  done(err, token, data);
                }
              })
              .catch((err) => {
                //console.log(err);
                res.send({
                  message: "The user already exists",
                  alert: "Error",
                });
              });
          },
          function (token, data, done) {
            const msg = {
              to: data.email, // Change to your recipient
              from: "katcon.updateprices@katcon.com", // Change to your verified sender
              //subject: 'Sending with SendGrid is Fun',
              //text: 'and easy to do anywhere, even with Node.js',
              //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
              template_id: "d-c47303c9884e43dfadd95cdf600de57f",
              dynamic_template_data: {
                link: `http://${req.headers.host}/confirm-email/${token}`,
              },
            };
            sgMail
              .send(msg)
              .then((email, err) => {
                console.log("Email sent");
                done(err, "done");
              })
              .catch((err) => {
                console.log(err);
              });
          },
        ],
        function (err, result) {
          if (err) {
            res.send({
              message: "Error while creating the user please try again",
              alert: "Error",
            });
          }
          if (result === "done") {
            res.send({
              message:
                "User created successfully please activate your account by clicking on the email that was send to you. Please check your junk email inbox.",
              alert: "Success",
            });
          }
        }
      );
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
          user_id: user.id,
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
  app.get("/get-items/:user", isAuthenticated, (req, res) => {
    const { user } = req.params;
    db.Vendor.findAll({
      include: [db.User, db.Item],
      where: {
        UserId: user,
      },
    })
      .then((data) => {
        let items = [];
        for (let i = 0; i < data.length; i++) {
          for (let j = 0; j < data[i].Items.length; j++) {
            items.push(data[i].Items[j].item_no);
          }
        }
        res.json(items);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Get Item princing
  app.get("/get-pricing/:item_no", isAuthenticated, (req, res) => {
    const { item_no } = req.params;
    db.Pricing.findAll({
      where: {
        item_no: item_no,
      },
      order: [["starting_date", "DESC"]],
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Get Valid Pricing
  app.get("/get-valid-pricing/:item_no", isAuthenticated, (req, res) => {
    const { item_no } = req.params;
    let today = Date.now();
    console.log(today);
    db.Pricing.findAll({
      include: [db.Item],
      where: {
        item_no: item_no,
        starting_date: {
          [Op.lte]: today,
        },
        ending_date: {
          [Op.gte]: today,
        },
      },
      order: [["starting_date", "DESC"]],
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Create New Pricing
  app.post("/post-new-pricing", isAuthenticated, (req, res) => {
    const {
      item_no,
      starting_date,
      ending_date,
      base_price,
      surcharge,
      currency,
      unit_measure,
    } = req.body;
    db.Pricing.create({
      item_no: item_no,
      starting_date: starting_date,
      ending_date: ending_date,
      base_price: base_price,
      surcharge: surcharge,
      currency: currency,
      unit_measure: unit_measure,
    })
      .then((data) => {
        if (!data) {
          res.send({
            message: "The price update was not uploaded",
            alert: "Error",
          });
        } else {
          res.send({ message: "Price update successfully", alert: "Success" });
        }
      })
      .catch((err) => {
        res.send({ message: "Server error", alert: "Error", err: err });
      });
  });

  //Get All Prices
  app.get("/get-all-prices", isAuthenticatedAdmin, (req, res) => {
    db.Pricing.findAll({
      order: [
        ["item_no", "ASC"],
        ["starting_date", "DESC"],
      ],
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
        console;
      });
  });

  //Get Pending Approval prices
  app.get("/get-price-pending", isAuthenticatedAdmin, (req, res) => {
    db.Pricing.findAll({
      include: [db.Item],
      where: {
        confirmed: "Submitted",
      },
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Get Item data
  app.get("/get-item-info/:item_no", isAuthenticated, (req, res) => {
    const { item_no } = req.params;
    db.Item.findOne({
      where: {
        item_no: item_no,
      },
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Post New Pricing
  app.post("/new-pricing", isAuthenticated, (req, res) => {
    const {
      item_no,
      starting_date,
      ending_date,
      base_price,
      surcharge,
      ItemId,
      confirmed,
    } = req.body;
    db.Pricing.create({
      item_no: item_no,
      starting_date: starting_date,
      ending_date: ending_date,
      base_price: base_price,
      surcharge: surcharge,
      ItemId: ItemId,
      confirmed: confirmed,
    })
      .then((data) => {
        if (!data) {
          res.send({
            message: "Pricing was not uploaded correctly",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Pricing submitted successfully",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Server error", alert: "Error", err: err });
        console.log(err);
      });
  });

  //Find if a contract exist for the date
  app.get(
    "/find-a-current-price/:item_no/:starting_date/:ending_date",
    (req, res) => {
      //const { starting_date, ending_date } = req.body;
      const { item_no, starting_date, ending_date } = req.params;
      db.Pricing.findOne({
        where: {
          item_no: item_no,
          [Op.or]: [
            {
              starting_date: {
                [Op.gte]: starting_date,
                [Op.lte]: ending_date,
              },
            },
            {
              ending_date: {
                [Op.gte]: starting_date,
                [Op.lte]: ending_date,
              },
            },
          ],
        },
      })
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  );

  //Upload Price File from Supplier The key is priceFile
  app.post(
    "/fileupload",
    upload.single("priceFile"),
    isAuthenticated,
    function (req, res, next) {
      //console.log(req.file);
      console.log(req.body);
      const { UserId } = req.body;
      let originalName = req.file.originalname;
      let fileSplit = originalName.split(".");
      let newName = req.file.filename;
      let fileExt = fileSplit[1];
      let path = req.file.destination;
      let tempPath = `${path}/${newName}`;
      let targetPath = `${path}/${newName}.${fileExt}`;
      let modifyPath = targetPath.replace(/\s+/g, "-").toLowerCase();
      fs.rename(tempPath.replace(/\/\//g, "/"), modifyPath, function (err) {
        if (err) {
          res.send({
            message: "Error uploading the file please try again",
            alert: "Error",
          });
        } else {
          db.File.create({
            file_name: `${newName}.${fileExt}`,
            UserId: UserId,
          })
            .then((data) => {
              if (!data) {
                res.send({
                  message: "Error uploading the file",
                  alert: "Error",
                });
              } else {
                res.send({
                  message: "File Uploaded Successfully",
                  alert: "Success",
                });
              }
            })
            .catch((err) => {
              res.send({ message: "Server Error", alert: "Error", err: err });
              console.log(err);
            });
        }
      });
    }
  );

  app.get("/download/:fileName", isAuthenticated, function (req, res) {
    const { fileName } = req.params;
    const file = `./priceFiles/${fileName}`;
    res.download(file, `${fileName}`, function (err) {
      if (err) {
        res.send({ message: "File not found", alert: "Error" });
      } else {
        //res.send({message:"File Downloaded",alert:"Success"})
        console.log("Downloaded");
      }
    });
  });

  //Get Pending to Review Files
  app.get("/get-pending-files", isAuthenticatedAdmin, (req, res) => {
    db.User.findAll({
      include: [
        {
          model: db.File,
          where: {
            status: "Submitted",
          },
          order: [["createdAt", "DESC"]],
        },
        {
          model: db.Vendor,
        },
      ],
    })
      .then((contracts) => {
        res.json(contracts);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Approve File
  app.put("/approve-file-price/:id", isAuthenticatedAdmin, (req, res) => {
    const { id } = req.params;
    db.File.findOne({
      where: {
        id: id,
      },
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Schema for excel file
  const schema = {
    "Part Number": {
      prop: "item_no",
      type: Number,
      required: true,
    },
    "Starting Date": {
      prop: "starting_date",
      type: Date,
      required: true,
    },
    "Ending Date": {
      prop: "ending_date",
      type: Date,
      required: true,
    },
    "Base Price": {
      prop: "base_price",
      type: Number,
      required: true,
    },
    Surcharge: {
      prop: "surcharge",
      type: Number,
    },
  };

  //Approve File Validation
  app.get("/validate-price-file/:id", isAuthenticatedAdmin, (req, res) => {
    const { id } = req.params;
    db.File.findOne({
      where: {
        id: id,
      },
    })
      .then((data) => {
        readXlsxFile(`./priceFiles/${data.file_name}`, { schema }).then(
          ({ rows, errors }) => {
            res.json(rows);
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Reject File
  app.put("/reject-file-price/:id", isAuthenticatedAdmin, (req, res) => {
    const { status, comments } = req.body;
    const { id } = req.params;
    db.File.update(
      {
        comments: comments,
        status: status,
      },
      {
        where: {
          id: id,
        },
      }
    )
      .then((fileUpdate) => {
        if (fileUpdate[0] === 0) {
          res.send({ message: "File not found to update", alert: "Error" });
        } else {
          res.send({
            message: "File status updated successfully",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Server error", alert: "Error" });
        console.log(err);
      });
  });

  //Get File Info by id
  app.get("/get-file-info/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.File.findOne({
      where: {
        id: id,
      },
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Download the Price Format
  app.get("/download-format", (req, res) => {
    const file = `./priceFiles/UpdatePriceFormatKatcon.xlsx`;
    res.download(file, `UpdatePriceFormatKatcon.xlsx`, function (err) {
      if (err) {
        res.send({ message: "File not found", alert: "Error" });
      } else {
        //res.send({message:"File Downloaded",alert:"Success"})
        console.log("Downloaded");
      }
    });
  });
};
