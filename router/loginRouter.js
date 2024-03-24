// external imports
const router = require("express").Router();

// internal imports
const { getLogin, doLogin, logout } = require("../controllers/loginController");
const decorateHtmlResponse = require("../middlewares/decorateHtmlResponse");
const {
  doLoginValidators,
  doLoginValidationHandler,
} = require("../middlewares/login/doLoginValidators");

router.get("/", decorateHtmlResponse("Login"), getLogin);

router.post(
  "/",
  decorateHtmlResponse("Login"),
  doLoginValidators,
  doLoginValidationHandler,
  doLogin
);

router.delete("/", logout);

module.exports = router;
