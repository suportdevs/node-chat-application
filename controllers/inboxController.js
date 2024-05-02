const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/People");
const escape = require("../utilies/escape");

async function getInbox(req, res, next) {
  try {
    const conversations = await Conversation.find({
      $or: [
        { "creator.id": req.user.user_id },
        { "participant.id": req.user.user_id },
      ],
    });

    // console.log(conversations);
    res.locals.data = conversations;
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
        id: req.user.user_id,
        name: req.user.username,
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

async function getMessages(req, res, next) {
  try {
    let messages = await Message.find({
      conversation_id: req.params.conversation_id,
    }).sort("-createdAt");
    const { participant } = await Conversation.findById(
      req.params.conversation_id
    );

    res.status(200).json({
      data: { messages, participant },
      user_id: req.user.user_id,
      conversation_id: req.params.conversation_id,
    });
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
  }
}

module.exports = { getInbox, searchUsers, addConversation, getMessages };
