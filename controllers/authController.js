// internal imports
const bcript = require("bcrypt");
const User = require("../models/People");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

async function getLogin(req, res, next) {
  try {
    res.render("index");
  } catch (error) {
    next(error);
  }
}

async function doLogin(req, res, next) {
  try {
    const { email, password, confirm_password } = req.body;
    if (password !== confirm_password) {
      throw createError("Password doesn't match!");
    }
    const user = await User.findOne({
      $or: [{ email: email }, { mobile: email }],
    });
    if (user && user._id) {
      const isPasswordValid = bcript.compare(password, user.password);
      if (isPasswordValid) {
        userObject = {
          user_id: user._id,
          username: user.name,
          email: user.email,
          mobile: user.mobile,
          avatar: user.avatar || null,
          role: user.role,
        };

        // generate token
        const token = jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
        });

        // set cookie
        res.cookie(process.env.COOKIE_NAME, token, {
          maxAge: process.env.JWT_EXPIRY,
          httpOnly: true,
          signed: true,
        });

        res.locals.loggedInUser = userObject;
        res.redirect("/inbox");
      } else {
        throw createError("Login faild! Please try agian.");
      }
    } else {
      throw createError("Login faild! Please try agian.");
    }
  } catch (error) {
    res.render("index", {
      data: { email: req.body.email },
      errors: { common: { msg: error.message } },
    });
  }
}

async function getRegister(req, res, next) {
  try {
    res.render("register");
  } catch (error) {
    next(error);
  }
}

async function doRegister(req, res, next) {
  try {
    const { name, email, mobile, password } = req.body;
    const hashedPassword = await bcript.hash(password, 10);

    const newUser = new User({ name, email, mobile, password: hashedPassword });
    const result = await newUser.save();
    res.locals.data.email = email;
    res.redirect("/");
  } catch (error) {
    res.render("register", { errors: { common: { msg: error.message } } });
  }
}

async function doLogout(req, res, next) {
  res.clearCookie(process.env.COOKIE_NAME);
  res.status(200).json({ message: "Logout successfull" });
}

module.exports = {
  getLogin,
  doLogin,
  getRegister,
  doRegister,
  doLogout,
};
