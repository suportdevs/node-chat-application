// external imports
const router = require("express").Router();

// internal imports
const { getInbox } = require("../controllers/inboxController");
const decoratedHtmlResponse = require("../middlewares/decoratedHtmlResponse");

router.get("/", decoratedHtmlResponse("Inbox"), getInbox);

module.exports = router;
