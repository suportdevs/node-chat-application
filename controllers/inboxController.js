// internal imports
const fs = require("fs");
const createError = require("http-errors");

// external imports
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
      hideable: { $nin: [req.user.user_id] },
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

async function sendMessage(req, res, next) {
  if (req.body.message || (req.files && req.files.length > 0)) {
    let attachments = null;
    if (req.files && req.files.length > 0) {
      attachments = [];
      req.files.forEach((file) => {
        attachments.push(file.filename);
      });
    }
    const newMessage = await Message({
      text: req.body.message,
      attachments: attachments,
      sender: {
        id: req.user.user_id,
        name: req.user.username,
        avatar: req.user.avatar || null,
      },
      receiver: {
        id: req.body.receiver_id,
        name: req.body.receiver_name,
        avatar: req.body.receiver_avatar || null,
      },
      conversation_id: req.body.conversation_id,
    });

    const result = await newMessage.save();

    global.io.emit("new_message", {
      message: {
        message: req.body.message,
        attachments: attachments,
        sender: {
          id: req.user.user_id,
          name: req.user.username,
          avatar: req.user.avatar || null,
        },
        conversation_id: req.body.conversation_id,
        date_time: result.date_id,
      },
    });

    res
      .status(200)
      .json({ message: "Message sent successfull.", data: result });
  } else {
    res.status(500).json({
      errors: { common: { msg: "Message or Attachment are required." } },
    });
  }
}

async function deleteMessage(req, res, next) {
  if (req.params.conversation_id) {
    try {
      const conversation_id = req.params.conversation_id;
      await Message.updateMany(
        { conversation_id },
        { $addToSet: { hideable: req.user.user_id } }
      );
      res.status(200).json({ message: "Message deleted successfull." });
    } catch (error) {
      res.status(500).json({ errors: { common: { msg: error.message } } });
    }
  } else {
    res.status(500).json({
      errors: {
        common: {
          msg: "You don't have select any conversation to delete messages.",
        },
      },
    });
  }
}

async function clearMessage(req, res, next) {
  if (req.params.conversation_id) {
    try {
      const conversation_id = req.params.conversation_id;
      const messages = await Message.find({ conversation_id });
      if (messages && messages.length > 0) {
        messages.forEach((message) => {
          if (message.attachments && message.attachments.length > 0) {
            for (const attachment of message.attachments) {
              fs.unlink(
                `${__dirname}/../public/uploads/attachments/${attachment}`,
                (err) => {
                  createError(err);
                }
              );
            }
          }
        });
        await Message.deleteMany({ conversation_id });
      } else {
        createError("You don't have any messages");
      }
      res.status(200).json({ message: "Message cleared successfull." });
    } catch (error) {
      res.status(500).json({ errors: { common: { msg: error.message } } });
    }
  } else {
    res.status(500).json({
      errors: {
        common: {
          msg: "You don't have select any conversation to delete messages.",
        },
      },
    });
  }
}

module.exports = {
  getInbox,
  searchUsers,
  addConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  clearMessage,
};
