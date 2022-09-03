// external imports
const express = require("express");
const router = express.Router();
const { getUser, addUser } = require("../controllers/userController");

// internal imports
const decoreteHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const avatarUploader = require("../middlewares/users/avatarUploader");
const {
  addValidators,
  addUserValidationHandler,
} = require("../middlewares/users/userValidators");

router.get("/", decoreteHtmlResponse("Users"), getUser);

router.post(
  "/",
  avatarUploader,
  addValidators,
  addUserValidationHandler,
  addUser
);

module.exports = router;
