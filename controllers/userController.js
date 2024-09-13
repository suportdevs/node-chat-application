const path = require("path");
const fs = require("fs");
const User = require("../models/People");

async function getUsers(req, res, next) {
  try {
    const users = await User.find();

    if (req.method == "GET") {
      res.locals.data = users;
      res.render("users");
    } else {
      res.status(200).json(users);
    }
  } catch (error) {
    if (req.method == "GET") {
      next(error);
    } else {
      res.status(500).json({ errors: { common: { msg: error.message } } });
    }
  }
}

async function updateUser(req, res, next) {
  const userId = req.params.id; // Using req.params.id to get user ID from the URL
  const newImage = req.file;

  if (!userId) {
    return res.status(400).json({
      errors: { common: { msg: "User ID and image are required." } },
    });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        errors: { common: { msg: "User not found." } },
      });
    }

    if (newImage) {
      if (user.avatar && user.avatar !== "default-avatar.png") {
        // const existingImagePath = path.join(
        //   __dirname,
        //   "..",
        //   "public",
        //   "uploads",
        //   "avatars",
        //   user.avatar
        // );
        const existingImagePath = path.join(
          __dirname,
          "../public/uploads/avatars/",
          user.avatar
        );
        if (fs.existsSync(existingImagePath)) {
          fs.unlinkSync(existingImagePath); // Delete the old image
        }
        // Update user with the new image
      }
      user.avatar = newImage.filename;
    }

    user.name = req.body.name || user.name;
    user.status = req.body.status || user.status;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;
    user.address = req.body.address || user.address;
    await user.save();

    if (!user) {
      return res.status(404).json({
        errors: { common: { msg: "User not found." } },
      });
    }

    res.status(200).json({ message: "Record updated successfully.", user });
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
  }
}

async function block(req, res, next) {
  if (req.body.user_id) {
    try {
      const user = await User.findByIdAndUpdate(
        req.body.user_id,
        {
          $addToSet: {
            blockable: {
              id: req.user.user_id,
              name: req.user.username,
              avatar: req.user.avatar,
            },
          },
        },
        { new: true }
      );
      if (!user) {
        res.status(500).json({
          errors: { common: { msg: "Something went wrong." } },
        });
      }
      res.status(200).json({ message: "User blocked successfull." });
    } catch (error) {
      res.status(500).json({ errors: { common: { msg: error.message } } });
    }
  } else {
    res.status(500).json({
      errors: { common: { msg: "You should provide a person." } },
    });
  }
}

async function unblock(req, res, next) {
  if (req.body.user_id) {
    try {
      const user = await User.findById(req.body.user_id);
      user.unblockUser(req.user.user_id);
      res.status(200).json({ message: "User unblocked successfull" });
    } catch (error) {
      res.status(500).json({ errors: { common: { msg: error.message } } });
    }
  } else {
    res.status(500).json({
      errors: { common: { msg: "You should provide a blocked person" } },
    });
  }
}

async function userDelete(req, res) {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({
      errors: { common: { msg: "You should provide a valid user." } },
    });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        errors: { common: { msg: "Your requested user not found." } },
      });
    }
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.save();

    res.status(200).json({ message: "Record deleted successfully.", user });
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
  }
}

module.exports = { getUsers, updateUser, block, unblock };
