// external imports
const router = require("express").Router();

// internal imports
const { getInbox } = require("../controllers/InboxController");
const decorateHtmlResponse = require("../middlewares/decorateHtmlResponse");

// get inbox page
router.get("/", decorateHtmlResponse("Inbox"), getInbox);

module.exports = router;
