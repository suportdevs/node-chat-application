const Conversation = require("../models/Conversation");
const User = require("../models/People");
const escape = require("../utilies/escape");

async function getInbox(req, res, next) {
  try {
    console.log(req.user);
    const conversations = await Conversation({
      $or: [
        { "creator.id": req.user.user_id },
        { "participant.id": req.user.user_id },
      ],
    });
    res.locals.data.conversations = conversations;
    res.render("inbox");
  } catch (error) {
    next(error);
  }
}

async function searchUsers(req, res, next) {
  const { user } = req.body;
  const searchQuery = user.replace("+88", "");
  try {
    if (!searchQuery)
      throw createError("You should provide any text to search.");
    const name_search_regex = new RegExp(escape(searchQuery), "i");
    const mobile_search_regex = new RegExp("^" + escape("+88" + searchQuery));
    const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");

    const users = await User.find(
      {
        $or: [
          { name: name_search_regex },
          { mobile: mobile_search_regex },
          { email: email_search_regex },
        ],
      },
      "name avatar"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
  }
}

async function addConversation(req, res, next) {
  try {
    const newConversation = new Conversation({
      creator: {
        id: req.user.userid,
        name: req.user.name,
        avatar: req.user.avatar || null,
      },
      participant: {
        id: req.body.id,
        name: req.body.participant,
        avatar: req.body.avatar || null,
      },
    });
    const result = await newConversation.save();
    res.status(200).json({ message: "Conversation was created successfull." });
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
  }
}

module.exports = { getInbox, searchUsers, addConversation };
