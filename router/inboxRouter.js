// external imports
const express = require("express");
const router = express.Router();
const { getInbox } = require("../controllers/inboxController");

// internal imports
const decoreteHtmlResponse = require("../middlewares/common/decorateHtmlResponse");

router.get("/", decoreteHtmlResponse("Inbox"), getInbox);

module.exports = router;
