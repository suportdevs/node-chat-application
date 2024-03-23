// external imports
const bcrypt = require("bcrypt");
const People = require("../models/People");
const path = require("path");
const { unlink } = require("fs");

// get users page
async function getUsers(req, res, next) {
  try {
    const users = await People.find();
    res.render("users", {
      users,
    });
  } catch (err) {
    res.status(500).json({ errors: { common: { msg: err.message } } });
  }
}

async function addUser(req, res, next) {
  let newUser;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

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
    console.log(err);
    res
      .status(500)
      .json({ errors: { common: { msg: "Unknow error occured!" } } });
  }
}

// delete user
async function deleteUser(req, res) {
  try {
    const user = await People.findByIdAndDelete({ _id: req.params.id });

    // remove user avatar if any
    if (user.avatar) {
      unlink(
        path.join(__dirname, `/../public/uploads/avatars/${user.avatar}`),
        (err) => {
          if (err) console.log(err);
        }
      );
    }

    res.status(200).json({
      message: "User deleted successfull.",
    });
  } catch (err) {
    res.status(500).json({ errors: { common: { msg: err.message } } });
  }
}

module.exports = {
  getUsers,
  addUser,
  deleteUser,
};
