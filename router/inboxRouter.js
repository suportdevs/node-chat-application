// external imports
const express = require("express");
const router = express.Router();
const { getInbox } = require("../controllers/inboxController");

// internal imports

router.get("/", getInbox);

module.exports = router;
