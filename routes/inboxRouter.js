// external imports
const router = require("express").Router();

// internal imports
const { getInbox } = require("../controllers/inboxController");
const authenticated = require("../middlewares/authenticated");
const decoratedHtmlResponse = require("../middlewares/decoratedHtmlResponse");

router.get("/", decoratedHtmlResponse("Inbox"), authenticated, getInbox);

module.exports = router;
