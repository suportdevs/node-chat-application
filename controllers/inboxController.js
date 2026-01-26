// internal imports
const fs = require("fs");
const createError = require("http-errors");

// external imports
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/People");
const escape = require("../utilies/escape");

function isMember(conversation, userId) {
  if (!conversation) return false;
  const userIdStr = userId.toString();
  if (conversation.isGroup) {
    return (conversation.members || []).some(
      (member) => member.id && member.id.toString() === userIdStr
    );
  }
  return (
    conversation.creator?.id?.toString() === userIdStr ||
    conversation.participant?.id?.toString() === userIdStr
  );
}

function getParticipantForUser(conversation, userId) {
  if (!conversation) return null;
  if (conversation.isGroup) {
    return {
      id: conversation._id,
      name: conversation.name || "Group",
      avatar: conversation.avatar || null,
      isGroup: true,
      members: conversation.members || [],
      admins: conversation.admins || [],
      createdBy: conversation.createdBy || null,
    };
  }
  const isCreator = conversation.creator?.id?.toString() === userId.toString();
  return isCreator ? conversation.participant : conversation.creator;
}

async function getInbox(req, res, next) {
  try {
    const conversations = await Conversation.find({
      $or: [
        { "creator.id": req.user.user_id },
        { "participant.id": req.user.user_id },
        { "members.id": req.user.user_id },
      ],
    }).sort({ last_updated: -1, updatedAt: -1 });

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
    const existingConversation = await Conversation.findOne({
      isGroup: false,
      $or: [
        {
          "creator.id": req.user.user_id,
          "participant.id": req.body.id,
        },
        {
          "creator.id": req.body.id,
          "participant.id": req.user.user_id,
        },
      ],
    });
    if (existingConversation) {
      return res.status(200).json({
        message: "Conversation already exists.",
        conversation_id: existingConversation._id,
      });
    }
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
    res.status(200).json({
      message: "Conversation was created successfull.",
      conversation_id: result._id,
    });
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
  }
}

async function createGroupConversation(req, res, next) {
  try {
    const { name, memberIds } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ errors: { common: { msg: "Group name is required." } } });
    }
    const membersToAdd = Array.isArray(memberIds) ? memberIds : [];
    const uniqueMemberIds = new Set(
      membersToAdd.filter(Boolean).map((id) => id.toString())
    );
    uniqueMemberIds.add(req.user.user_id.toString());
    const users = await User.find(
      { _id: { $in: Array.from(uniqueMemberIds) } },
      "name avatar"
    );
    const members = users.map((user) => ({
      id: user._id,
      name: user.name,
      avatar: user.avatar || null,
    }));

    const conversation = new Conversation({
      isGroup: true,
      name: name.trim(),
      avatar: null,
      members,
      admins: [req.user.user_id],
      createdBy: {
        id: req.user.user_id,
        name: req.user.username,
        avatar: req.user.avatar || null,
      },
    });
    const result = await conversation.save();
    res.status(200).json({
      message: "Group conversation created.",
      conversation_id: result._id,
    });
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
  }
}

async function addGroupMembers(req, res, next) {
  const { conversation_id } = req.params;
  const { memberIds } = req.body;
  try {
    const conversation = await Conversation.findById(conversation_id);
    if (!conversation || !conversation.isGroup) {
      return res
        .status(404)
        .json({ errors: { common: { msg: "Group not found." } } });
    }
    const isAdmin = (conversation.admins || []).some(
      (id) => id.toString() === req.user.user_id.toString()
    );
    if (!isAdmin) {
      return res
        .status(403)
        .json({ errors: { common: { msg: "Only admins can add members." } } });
    }
    const ids = Array.isArray(memberIds) ? memberIds : [];
    if (ids.length === 0) {
      return res
        .status(400)
        .json({ errors: { common: { msg: "No members provided." } } });
    }
    const currentIds = new Set(
      (conversation.members || []).map((member) => member.id.toString())
    );
    const targetIds = ids
      .map((id) => id.toString())
      .filter((id) => !currentIds.has(id));
    if (targetIds.length === 0) {
      return res.status(200).json({ message: "Members already exist." });
    }
    const users = await User.find({ _id: { $in: targetIds } }, "name avatar");
    const newMembers = users.map((user) => ({
      id: user._id,
      name: user.name,
      avatar: user.avatar || null,
    }));
    conversation.members = [...(conversation.members || []), ...newMembers];
    await conversation.save();
    res.status(200).json({ message: "Members added." });
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
  }
}

async function removeGroupMember(req, res, next) {
  const { conversation_id } = req.params;
  const { memberId } = req.body;
  try {
    const conversation = await Conversation.findById(conversation_id);
    if (!conversation || !conversation.isGroup) {
      return res
        .status(404)
        .json({ errors: { common: { msg: "Group not found." } } });
    }
    const isAdmin = (conversation.admins || []).some(
      (id) => id.toString() === req.user.user_id.toString()
    );
    if (!isAdmin) {
      return res
        .status(403)
        .json({ errors: { common: { msg: "Only admins can remove members." } } });
    }
    if (!memberId) {
      return res
        .status(400)
        .json({ errors: { common: { msg: "Member id required." } } });
    }
    conversation.members = (conversation.members || []).filter(
      (member) => member.id.toString() !== memberId.toString()
    );
    conversation.admins = (conversation.admins || []).filter(
      (id) => id.toString() !== memberId.toString()
    );
    if (conversation.admins.length === 0 && conversation.members.length > 0) {
      conversation.admins = [conversation.members[0].id];
    }
    await conversation.save();
    res.status(200).json({ message: "Member removed." });
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
  }
}

async function leaveGroup(req, res, next) {
  const { conversation_id } = req.params;
  try {
    const conversation = await Conversation.findById(conversation_id);
    if (!conversation || !conversation.isGroup) {
      return res
        .status(404)
        .json({ errors: { common: { msg: "Group not found." } } });
    }
    const userIdStr = req.user.user_id.toString();
    conversation.members = (conversation.members || []).filter(
      (member) => member.id.toString() !== userIdStr
    );
    conversation.admins = (conversation.admins || []).filter(
      (id) => id.toString() !== userIdStr
    );
    if (conversation.members.length === 0) {
      await Message.deleteMany({ conversation_id });
      await Conversation.deleteOne({ _id: conversation_id });
      return res.status(200).json({ message: "Group deleted." });
    }
    if (conversation.admins.length === 0 && conversation.members.length > 0) {
      conversation.admins = [conversation.members[0].id];
    }
    await conversation.save();
    res.status(200).json({ message: "You left the group." });
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
  }
}

async function renameGroup(req, res, next) {
  const { conversation_id } = req.params;
  const { name } = req.body;
  try {
    const conversation = await Conversation.findById(conversation_id);
    if (!conversation || !conversation.isGroup) {
      return res
        .status(404)
        .json({ errors: { common: { msg: "Group not found." } } });
    }
    const isAdmin = (conversation.admins || []).some(
      (id) => id.toString() === req.user.user_id.toString()
    );
    if (!isAdmin) {
      return res
        .status(403)
        .json({ errors: { common: { msg: "Only admins can rename groups." } } });
    }
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ errors: { common: { msg: "Group name is required." } } });
    }
    conversation.name = name.trim();
    await conversation.save();
    res.status(200).json({ message: "Group name updated." });
  } catch (error) {
    res.status(500).json({ errors: { common: { msg: error.message } } });
  }
}

async function getMessages(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const before = req.query.before ? new Date(req.query.before) : null;
    const conversation = await Conversation.findById(
      req.params.conversation_id
    );
    if (!conversation) {
      return res.status(404).json({
        errors: { common: { msg: "Conversation not found." } },
      });
    }
    if (!isMember(conversation, req.user.user_id)) {
      return res
        .status(403)
        .json({ errors: { common: { msg: "Not allowed." } } });
    }
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

    const participant = getParticipantForUser(
      conversation,
      req.user.user_id
    );
    const participantUser =
      !conversation.isGroup && participant?.id
        ? await User.findById(participant.id)
        : null;

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
    const conversation = await Conversation.findById(req.body.conversation_id);
    if (!conversation) {
      return res
        .status(404)
        .json({ errors: { common: { msg: "Conversation not found." } } });
    }
    if (!isMember(conversation, req.user.user_id)) {
      return res
        .status(403)
        .json({ errors: { common: { msg: "Not allowed." } } });
    }
    const receiver =
      conversation.isGroup || !req.body.receiver_id
        ? null
        : {
            id: req.body.receiver_id,
            name: req.body.receiver_name,
            avatar: req.body.receiver_avatar || null,
          };

    const newMessage = await Message({
      text: req.body.message,
      attachments: attachments,
      sender: {
        id: req.user.user_id,
        name: req.user.username,
        avatar: req.user.avatar || null,
      },
      receiver: receiver,
      conversation_id: req.body.conversation_id,
    });

    const result = await newMessage.save();

    // update conversation
    conversation.message = {
      id: result._id,
      content: req.body.message || "Attachment",
      date_time: result.createdAt,
    };
    conversation.last_updated = new Date();

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
      const conversation = await Conversation.findById(conversation_id);
      if (!conversation) {
        return res
          .status(404)
          .json({ errors: { common: { msg: "Conversation not found." } } });
      }
      if (!isMember(conversation, req.user.user_id)) {
        return res
          .status(403)
          .json({ errors: { common: { msg: "Not allowed." } } });
      }
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
    const isDirectParticipant =
      message.sender?.id?.toString() === req.user.user_id.toString() ||
      message.receiver?.id?.toString() === req.user.user_id.toString();
    let isAllowed = isDirectParticipant;
    if (!isAllowed) {
      const conversation = await Conversation.findById(message.conversation_id);
      if (conversation && conversation.isGroup) {
        isAllowed = isMember(conversation, req.user.user_id);
      }
    }
    if (!isAllowed) {
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
    const conversation = await Conversation.findById(
      req.params.conversation_id
    );
    if (!conversation) {
      return res.status(404).json({
        errors: { common: { msg: "Conversation not found." } },
      });
    }
    if (!isMember(conversation, req.user.user_id)) {
      return res
        .status(403)
        .json({ errors: { common: { msg: "Not allowed." } } });
    }
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
      const conversation = await Conversation.findById(conversation_id);
      if (!conversation) {
        return res
          .status(404)
          .json({ errors: { common: { msg: "Conversation not found." } } });
      }
      if (!isMember(conversation, req.user.user_id)) {
        return res
          .status(403)
          .json({ errors: { common: { msg: "Not allowed." } } });
      }
      if (conversation.isGroup) {
        const isAdmin = (conversation.admins || []).some(
          (id) => id.toString() === req.user.user_id.toString()
        );
        if (!isAdmin) {
          return res.status(403).json({
            errors: { common: { msg: "Only admins can clear messages." } },
          });
        }
      }
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
  createGroupConversation,
  addGroupMembers,
  removeGroupMember,
  leaveGroup,
  renameGroup,
  getMessages,
  searchMessages,
  sendMessage,
  deleteMessage,
  clearMessage,
  deleteSingleMessage,
};
