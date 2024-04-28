// external imports
const router = require("express").Router();

// internal imports
const {
  getInbox,
  searchUsers,
  addConversation,
} = require("../controllers/inboxController");
const authenticated = require("../middlewares/authenticated");
const decoratedHtmlResponse = require("../middlewares/decoratedHtmlResponse");

router.get("/", decoratedHtmlResponse("Inbox"), authenticated, getInbox);

router.post("/search", searchUsers);

router.post("/conversation", addConversation);

module.exports = router;
