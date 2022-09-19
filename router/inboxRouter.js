// external imports
const express = require("express");
const router = express.Router();

// internal imports
const { getInbox, searchUsers } = require("../controllers/inboxController");
const decoreteHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const { checkLogin } = require("../middlewares/common/checkLogin");

const page_title = "Inbox";

router.get("/", decoreteHtmlResponse(page_title), checkLogin, getInbox);

router.post("/search", decoreteHtmlResponse(page_title), searchUsers);

module.exports = router;
