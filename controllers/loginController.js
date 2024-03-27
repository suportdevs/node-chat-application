// internal imports
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");

// external imports
const User = require("../models/People");

// get login page
function getLogin(req, res, next) {
  res.render("index");
}

async function doLogin(req, res, next) {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.username }],
    });
    if (user && user._id) {
      // check password is valid
      const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (isPasswordValid) {
        const userObject = {
          userid: user._id,
          username: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
        };

        // generate token
        const token = await jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
        });

        // set cookie
        res.cookie(process.env.COOKIE_NAME, token, {
          maxAge: process.env.JWT_EXPIRY,
          httpOnly: true,
          signed: true,
        });

        //set the logged in user in local indentifier
        res.locals.loggedInUser = userObject;

        res.render("inbox");
      } else {
        throw createError("Login failed! Please try again.");
      }
    } else {
      throw createError("Login failed! Please try again.");
    }
  } catch (err) {
    res.render("index", {
      data: { username: req.body.username },
      errors: { common: { msg: err.message } },
    });
  }
}

function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME);
  res.send("Logout successfull");
}

module.exports = {
  getLogin,
  doLogin,
  logout,
};
