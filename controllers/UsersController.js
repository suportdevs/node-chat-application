// external imports
const bcrypt = require("bcrypt");
const People = require("../models/People");

// get users page
function getUsers(req, res, next) {
  res.render("users");
}

async function addUser(req, res, next) {
  let newUser;
  const hashedPassword = bcrypt.hash(req.body.password, 10);
  if (req.files && req.files.length > 0) {
    newUser = new People({
      ...req.body,
      avatar: req.files[0].filename,
      password: hashedPassword,
    });
  } else {
    newUser = new People({
      ...req.body,
      password: hashedPassword,
    });
  }

  // save user or send error
  try {
    const result = await newUser.save();
    res.status(200).json({ message: "User created successfull." });
  } catch (err) {
    res
      .status(500)
      .json({ errors: { common: { msg: "Unknow error occured!" } } });
  }
}

module.exports = {
  getUsers,
  addUser,
};
