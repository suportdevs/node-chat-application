// external imports
const router = require("express").Router();

// internal imports
const {
  getLogin,
  getRegister,
  doRegister,
} = require("../controllers/authController");
const decoratedHtmlResponse = require("../middlewares/decoratedHtmlResponse");

router.get("/", decoratedHtmlResponse("Login"), getLogin);

router.get("/register", decoratedHtmlResponse("Register"), getRegister);

router.post("/register", decoratedHtmlResponse("Register"), doRegister);

module.exports = router;
