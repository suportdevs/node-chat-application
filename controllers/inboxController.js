// external imports
const createError = require("http-errors");

// internal imports
const escape = require("../utilities/escape");
const User = require("../models/People");
const Conversion = require("../models/Conversion");

function getInbox(req, res, next) {
  res.render("inbox.ejs");
}

async function searchUsers(req, res, next) {
  const user = req.body.user;
  const searchquery = user.replace("+88", "");

  const name_search_regex = new RegExp(escape(searchquery), "i");
  const number_search_regex = new RegExp("^" + escape("+88" + searchquery));
  const email_seach_regex = new RegExp("^" + escape(searchquery) + "$", "i");

  try {
    if (searchquery !== "") {
      const users = await User.find(
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

async function addConversion(req, res, next) {
  try {
    const newConversion = new Conversion({
      creator: {
        id: req.user.userId,
        name: req.user.username,
        avatar: req.user.avatar || null,
      },
      participant: {
        id: req.body.id,
        name: req.body.participant,
        avatar: req.body.avatar || null,
      },
    });

    const result = await newConversion.save();
    res.status(200).json({
      message: "Conversion create successfull.",
    });
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
  searchUsers,
  addConversion,
};
