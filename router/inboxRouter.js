// external imports
const router = require("express").Router();

// internal imports
const { getInbox } = require("../controllers/InboxController");

// get inbox page
router.get("/", getInbox);

module.exports = router;
