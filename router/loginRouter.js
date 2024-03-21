// external imports
const router = require("express").Router();

// internal imports
const { getLogin } = require("../controllers/loginController");
const decorateHtmlResponse = require("../middlewares/decorateHtmlResponse");

router.get("/", decorateHtmlResponse("Login"), getLogin);

module.exports = router;
