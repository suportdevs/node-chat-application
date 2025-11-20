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

router.get('/call', (req, res) => {
  // adapt: get user id from your auth cookie/session
  const userId = req.user ? req.user._id.toString() : 'guest-' + Date.now();
  res.render('call', { userId });
});

module.exports = router;
