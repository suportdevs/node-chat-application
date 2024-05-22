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

module.exports = { getUsers, block, unblock };
