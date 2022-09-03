// external imports
const bcrypt = require("bcrypt");

// internal imports
const User = require("../models/People");

function getUser(req, res, next) {
  res.render("users.ejs");
}

async function addUser(req, res, next) {
  let newUser;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  if (req.files && req.files.length > 0) {
    newUser = new User({
      ...req.body,
      avatar: req.files[0].filename,
      password: hashedPassword,
    });
  } else {
    newUser = new User({
      ...req.body,
      password: hashedPassword,
    });
  }

  try {
    await newUser.save();
    res.status(200).json({ massege: "User created successfull." });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Unknow error occured!",
        },
      },
    });
  }
}

module.exports = {
  getUser,
  addUser,
};
