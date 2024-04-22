// external imports
const router = require("express").Router();

// internal imports
const { getInbox } = require("../controllers/inboxController");

router.get("/", getInbox);

module.exports = router;
