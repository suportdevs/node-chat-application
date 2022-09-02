// external imports
const express = require("express");
const router = express.Router();
const { getLogin } = require("../controllers/loginController");

// internal imports
const decoreteHtmlResponse = require("../middlewares/common/decorateHtmlResponse");

router.get("/", decoreteHtmlResponse("Login"), getLogin);

module.exports = router;
