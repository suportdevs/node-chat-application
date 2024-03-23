// external imports
const router = require("express").Router();

// internal imports
const {
  getUsers,
  addUser,
  deleteUser,
} = require("../controllers/UsersController");
const decorateHtmlResponse = require("../middlewares/decorateHtmlResponse");
const avatarUpload = require("../middlewares/users/avatarUpload");
const {
  addUserValidators,
  addUserValidationHandler,
} = require("../middlewares/users/userValidators");
// get users page
router.get("/", decorateHtmlResponse("Users"), getUsers);

router.post(
  "/",
  avatarUpload,
  addUserValidators,
  addUserValidationHandler,
  addUser
);

router.delete("/:id", deleteUser);

module.exports = router;
