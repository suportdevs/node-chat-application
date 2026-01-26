// external imports
const router = require("express").Router();

// internal imports
const {
  getInbox,
  searchUsers,
  addConversation,
  getMessages,
  searchMessages,
  sendMessage,
  deleteMessage,
  clearMessage,
  deleteSingleMessage,
} = require("../controllers/inboxController");
const attachmentUpload = require("../middlewares/attachmentUploader");
const authenticated = require("../middlewares/authenticated");
const decoratedHtmlResponse = require("../middlewares/decoratedHtmlResponse");

router.get("/", decoratedHtmlResponse("Inbox"), authenticated, getInbox);

router.post("/", authenticated, getInbox);

router.post("/search", searchUsers);

router.post("/conversation", authenticated, addConversation);

router.get("/message/:conversation_id", authenticated, getMessages);
router.get("/message/search/:conversation_id", authenticated, searchMessages);

router.post("/message", attachmentUpload, authenticated, sendMessage);
router.delete("/message/single/:message_id", authenticated, deleteSingleMessage);

router.delete("/message/delete/:conversation_id", authenticated, deleteMessage);

router.delete("/message/clear/:conversation_id", authenticated, clearMessage);

module.exports = router;
