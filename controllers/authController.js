// internal imports
const bcript = require("bcrypt");

async function getLogin(req, res, next) {
  try {
    res.render("index");
  } catch (error) {
    next(error);
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

module.exports = {
  getLogin,
  getRegister,
  doRegister,
};
