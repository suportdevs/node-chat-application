// external imports
const express = require("express");
const router = express.Router();
const { getUser } = require("../controllers/userController");

// internal imports
const decoreteHtmlResponse = require("../middlewares/common/decorateHtmlResponse");

router.get("/", decoreteHtmlResponse("Users"), getUser);

module.exports = router;
