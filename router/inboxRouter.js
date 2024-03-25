// external imports
const router = require("express").Router();

// internal imports
const { getInbox } = require("../controllers/InboxController");
const authenticated = require("../middlewares/authenticated");
const decorateHtmlResponse = require("../middlewares/decorateHtmlResponse");

// get inbox page
router.get("/", decorateHtmlResponse("Inbox"), authenticated, getInbox);

module.exports = router;
