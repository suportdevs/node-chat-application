// external imports
const router = require("express").Router();

// internal imports
const {
  getLogin,
  getRegister,
  doRegister,
  doLogin,
} = require("../controllers/authController");
const decoratedHtmlResponse = require("../middlewares/decoratedHtmlResponse");
const {
  doLoginValidator,
  doLoginValidationHandler,
} = require("../middlewares/doLoginValidator");
const {
  registerValidators,
  registerValidationHandler,
} = require("../middlewares/registerValidator");

router.get("/", decoratedHtmlResponse("Login"), getLogin);

router.post(
  "/",
  decoratedHtmlResponse("Inbox"),
  doLoginValidator,
  doLoginValidationHandler,
  doLogin
);

router.get("/register", decoratedHtmlResponse("Register"), getRegister);

router.post(
  "/register",
  decoratedHtmlResponse("Register"),
  registerValidators,
  registerValidationHandler,
  doRegister
);

module.exports = router;
