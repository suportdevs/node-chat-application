// external imports
const express = require("express");
const router = express.Router();

// internal imports
const decoreteHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const avatarUploader = require("../middlewares/users/avatarUploader");
const {
  addValidators,
  addUserValidationHandler,
} = require("../middlewares/users/userValidators");
const {
  getUser,
  addUser,
  removeUser,
} = require("../controllers/userController");

router.get("/", decoreteHtmlResponse("Users"), getUser);

router.post(
  "/",
  avatarUploader,
  addValidators,
  addUserValidationHandler,
  addUser
);

router.delete("/:id", removeUser);

module.exports = router;
