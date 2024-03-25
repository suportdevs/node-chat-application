// external imports
const router = require("express").Router();

// internal imports
const { getLogin, doLogin, logout } = require("../controllers/loginController");
const decorateHtmlResponse = require("../middlewares/decorateHtmlResponse");
const {
  doLoginValidators,
  doLoginValidationHandler,
} = require("../middlewares/login/doLoginValidators");
const redirectIfAuthenticated = require("../middlewares/redirectIfAuthenticated");

router.get(
  "/",
  decorateHtmlResponse("Login"),
  redirectIfAuthenticated,
  getLogin
);

router.post(
  "/",
  decorateHtmlResponse("Login"),
  doLoginValidators,
  doLoginValidationHandler,
  doLogin
);

router.delete("/", logout);

module.exports = router;
