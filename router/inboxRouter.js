// external imports
const express = require("express");
const router = express.Router();
const { getInbox } = require("../controllers/inboxController");

// internal imports
const decoreteHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const { checkLogin } = require("../middlewares/common/checkLogin");

router.get("/", decoreteHtmlResponse("Inbox"), checkLogin, getInbox);

module.exports = router;
