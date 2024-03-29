// internal imports
const createError = require("http-errors");

// external imports
const User = require("../models/People");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const escape = require("../utilities/escape");

// get inbox page
async function getInbox(req, res, next) {
  try {
    const conversations = await Conversation.find({
      $or: [
        { "creator.id": req.user.userid },
        { "participant.id": req.user.userid },
      ],
    });
    res.locals.data = conversations;
    res.render("inbox");
  } catch (err) {
    next(err);
  }
}

async function searchUsers(req, res, next) {
  const user = req.body.user;
  const searchQuery = user.replace("+88", "");

  const name_search_regex = new RegExp(escape(searchQuery), "i");
  const mobile_search_regex = new RegExp("^" + escape(searchQuery));
  const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");

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

async function addConversation(req, res, next) {
  try {
    const newConversation = new Conversation({
      creator: {
        id: req.user.userid,
        name: req.user.username,
        avatar: req.user.avatar || null,
      },
      participant: {
        name: req.body.participant,
        id: req.body.id,
        avatar: req.body.avatar || null,
      },
    });
    const result = await newConversation.save();
    res.status(200).json({
      message: "Conversation was added successfull.",
    });
  } catch (err) {
    res.status(500).json({ errors: { common: { msg: err.message } } });
  }
}

// get messages
async function getMessages(req, res, next) {
  try {
    const messages = await Message.find({
      conversation_id: req.params.conversation_id,
    });
    const { participant } = await Conversation.findById(
      req.params.conversation_id
    );
    res.status(200).json({
      data: {
        messages,
        participant,
      },
      userid: req.user.userid,
      conversation_id: req.params.conversation_id,
    });
  } catch (err) {
    res.status(500).json({ errors: { common: { msg: err.message } } });
  }
}

async function sendMessage(req, res, next) {
  if (req.body.message || (req.files && req.files.length > 0)) {
    try {
      let attachments = null;
      if (req.files && req.files.length > 0) {
        attachments = [];

        req.files.forEach((file) => {
          attachments.push(file.filename);
        });
      }

      const newMessage = new Message({
        text: req.body.message,
        sender: {
          id: req.user.userid,
          name: req.user.username,
          avatar: req.user.avatar || null,
        },
        receiver: {
          id: req.body.receiverId,
          name: req.body.receiverName,
          avatar: req.body.receiverAvatar || null,
        },
        conversation_id: req.body.conversationId,
      });

      const result = await newMessage.save();

      res.status(200).json({ message: "Successfull", data: result });
    } catch (err) {
      res.status(500).json({ errors: { common: { msg: err.message } } });
    }
  } else {
    res.status(500).json({
      errors: { common: { msg: "Message text or attach is required!" } },
    });
  }
}

module.exports = {
  getInbox,
  searchUsers,
  addConversation,
  getMessages,
  sendMessage,
};
