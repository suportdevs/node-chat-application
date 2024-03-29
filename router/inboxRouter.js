// external imports
const router = require("express").Router();

// internal imports
const {
  getInbox,
  searchUsers,
  addConversation,
  getMessages,
} = require("../controllers/InboxController");
const authenticated = require("../middlewares/authenticated");
const decorateHtmlResponse = require("../middlewares/decorateHtmlResponse");

// get inbox page
router.get("/", decorateHtmlResponse("Inbox"), authenticated, getInbox);

router.post("/search", authenticated, searchUsers);
router.post("/conversation", authenticated, addConversation);
router.get("/messages/:conversation_id", authenticated, getMessages);

module.exports = router;
