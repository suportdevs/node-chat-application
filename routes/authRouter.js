// external imports
const router = require("express").Router();

// internal imports
const {
  getLogin,
  getRegister,
  doRegister,
  doLogin,
  doLogout,
} = require("../controllers/authController");
const { getProfile } = require("../controllers/userController");
const decoratedHtmlResponse = require("../middlewares/decoratedHtmlResponse");
const {
  doLoginValidator,
  doLoginValidationHandler,
} = require("../middlewares/doLoginValidator");
const redirectIfAuthenticated = require("../middlewares/redirectIfAuthenticated");
const authenticated = require("../middlewares/authenticated");
const {
  registerValidators,
  registerValidationHandler,
} = require("../middlewares/registerValidator");

router.get(
  "/",
  decoratedHtmlResponse("Login"),
  redirectIfAuthenticated,
  getLogin
);

router.post(
  "/",
  decoratedHtmlResponse("Login"),
  doLoginValidator,
  doLoginValidationHandler,
  doLogin
);

router.get(
  "/register",
  decoratedHtmlResponse("Register"),
  redirectIfAuthenticated,
  getRegister
);

router.post(
  "/register",
  decoratedHtmlResponse("Register"),
  registerValidators,
  registerValidationHandler,
  doRegister
);

router.delete("/logout", authenticated, doLogout);

router.get(
  "/profile",
  decoratedHtmlResponse("Profile"),
  authenticated,
  getProfile
);

router.get("/call", decoratedHtmlResponse("Inbox"), authenticated, (req, res) => {
  res.redirect("/inbox");
});

module.exports = router;
