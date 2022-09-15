// external imports
const express = require("express");
const router = express.Router();

// internal imports
const decoreteHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const {
  doLoginValidators,
  doLoginValidationHandler,
} = require("../middlewares/login/loginValidation");
const { getLogin, doLogin } = require("../controllers/loginController");
const { redirectLoggedIn } = require("../middlewares/common/checkLogin");

const page_title = "Login";

router.get("/", decoreteHtmlResponse(page_title), redirectLoggedIn, getLogin);

router.post(
  "/",
  decoreteHtmlResponse(page_title),
  doLoginValidators,
  doLoginValidationHandler,
  doLogin
);

module.exports = router;
