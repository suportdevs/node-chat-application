// external imports
const bcrypt = require("bcrypt");
const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");

// internal imports
const User = require("../models/People");

function getLogin(req, res, next) {
  res.render("index.ejs");
}

async function doLogin(req, res, next) {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.username }],
    });

    if (user && user._id) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (isValidPassword) {
        const userObject = {
          username: user.name,
          mobile: user.mobile,
          email: user.email,
          role: "User",
        };

        // genarate token
        const token = jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });

        // set cookie
        res.cookie(process.env.COOKIE_NAME, token, {
          maxAge: process.env.JWT_EXPIRE,
          httpOnly: true,
          singed: true,
        });

        res.locals.loggedInUser = userObject;

        res.render("inbox.ejs");
      } else {
        throw createHttpError("Login faild! Please try again.");
      }
    } else {
      throw createHttpError("Login faild! Please try again.");
    }
  } catch (err) {
    res.render("index.ejs", {
      data: {
        username: req.body.username,
      },
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

module.exports = {
  getLogin,
  doLogin,
};
