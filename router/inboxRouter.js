// external imports
const router = require("express").Router();

// internal imports
const {
  getInbox,
  searchUsers,
  addConversation,
  getMessages,
  sendMessage,
} = require("../controllers/InboxController");
const authenticated = require("../middlewares/authenticated");
const decorateHtmlResponse = require("../middlewares/decorateHtmlResponse");
const attachmentUpload = require("../middlewares/users/attachmentUpload");

// get inbox page
router.get("/", decorateHtmlResponse("Inbox"), authenticated, getInbox);

router.post("/search", authenticated, searchUsers);
router.post("/conversation", authenticated, addConversation);
router.get("/messages/:conversation_id", authenticated, getMessages);
router.post("/message", authenticated, attachmentUpload, sendMessage);

module.exports = router;
