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

    if (req.method == "GET") {
      res.locals.data = conversations;
      res.render("inbox");
    } else {
      res.status(200).json(conversations);
    }
  } catch (error) {
    if (res.method == "GET") {
      next(error);
    } else {
      res.status(500).json({ errors: { common: { msg: error.message } } });
    }
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
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const before = req.query.before ? new Date(req.query.before) : null;
    const query = {
      conversation_id: req.params.conversation_id,
      hideable: { $nin: [req.user.user_id] },
    };
    if (before && !Number.isNaN(before.getTime())) {
      query.createdAt = { $lt: before };
    }

    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    if (hasMore) messages = messages.slice(0, limit);
    messages = messages.reverse();

    const { participant } = await Conversation.findById(
      req.params.conversation_id
    );
    const participantUser = await User.findById(participant.id);

    res.status(200).json({
      data: { messages, participant },
      pagination: {
        hasMore,
        nextBefore: messages.length ? messages[0].createdAt : null,
      },
      user_id: req.user.user_id,
      conversation_id: req.params.conversation_id,
      participantUser,
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

    // update conversation
    const conversation = await Conversation.findById(req.body.conversation_id);
    if (!conversation) {
      return res
        .status(404)
        .json({ common: { msg: "Conversation not found" } });
    }
    conversation.message = {
      id: result._id,
      content: req.body.message,
      date_time: result.createdAt,
    };

    await conversation.save();

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
        date_time: result.createdAt,
        message_id: result._id,
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

      // get lasted message
      const lastMessage = await Message.findOne({ conversation_id })
        .sort({ createdAt: -1 })
        .limit(1);

      if (lastMessage) {
        // Update the conversation with the last message details
        await Conversation.findByIdAndUpdate(conversation_id, {
          message: {
            id: lastMessage._id,
            content: lastMessage.text,
            date_time: lastMessage.createdAt,
          },
        });
      }

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

async function deleteSingleMessage(req, res, next) {
  const messageId = req.params.message_id;
  if (!messageId) {
    return res.status(400).json({
      errors: { common: { msg: "Message id is required." } },
    });
  }
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        errors: { common: { msg: "Message not found." } },
      });
    }
    const isParticipant =
      message.sender?.id?.toString() === req.user.user_id.toString() ||
      message.receiver?.id?.toString() === req.user.user_id.toString();
    if (!isParticipant) {
      return res.status(403).json({
        errors: { common: { msg: "Not allowed." } },
      });
    }
    await Message.updateOne(
      { _id: messageId },
      { $addToSet: { hideable: req.user.user_id } }
    );
    res.status(200).json({ message: "Message removed." });
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
  }
}

async function searchMessages(req, res, next) {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({
      errors: { common: { msg: "Search text is required." } },
    });
  }
  try {
    const regex = new RegExp(escape(query), "i");
    const messages = await Message.find({
      conversation_id: req.params.conversation_id,
      hideable: { $nin: [req.user.user_id] },
      text: regex,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ data: { messages } });
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
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
  searchMessages,
  sendMessage,
  deleteMessage,
  clearMessage,
  deleteSingleMessage,
};
