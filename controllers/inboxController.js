// external imports
const createError = require("http-errors");

// internal imports
const escape = require("../utilities/escape");
const User = require("../models/People");

function getInbox(req, res, next) {
  res.render("inbox.ejs");
}

async function sarchUsers(req, res, next) {
  const user = req.body.user;
  const searchquery = user.replace("+88", "");

  const name_search_regex = new RegExp(escape(searchquery), "i");
  const number_search_regex = new RegExp("^", escape("+88" + searchquery));
  const email_seach_regex = new RegExp("^", escape(searchquery), "$", "i");

  try {
    if (searchquery !== "") {
      const users = User.find(
        {
          $or: [
            { name: name_search_regex },
            { mobile: number_search_regex },
            { email: email_seach_regex },
          ],
        },
        "name avatar"
      );
      res.json(users);
    } else {
      throw createError("You must provide some text to search!");
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

module.exports = {
  getInbox,
};
