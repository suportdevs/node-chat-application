// internal imports
const createError = require("http-errors");

// external imports
const User = require("../models/People");

// get inbox page
function getInbox(req, res, next) {
  res.render("inbox");
}

async function searchUsers(req, res, next) {
  const user = req.body.user;
  const searchQuery = user.replace("+88", "");

  const name_search_regex = new RegExp(escape(searchQuery), "i");
  const mobile_search_regex = new RegExp("^" + escape(searchQuery));
  const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");

  console.log(mobile_search_regex);
  try {
    if (searchQuery !== "") {
      const users = await User.find(
        {
          $or: [
            {
              name: name_search_regex,
            },
            {
              mobile: "+88" + mobile_search_regex,
            },
            {
              email: email_search_regex,
            },
          ],
        },
        "name avatar"
      );
      res.json(users);
    } else {
      throw createError("You should provide any text to search");
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

module.exports = { getInbox, searchUsers };
