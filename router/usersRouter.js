// external imports
const router = require("express").Router();

// internal imports
const {
  getUsers,
  addUser,
  deleteUser,
} = require("../controllers/UsersController");
const authenticated = require("../middlewares/authenticated");
const decorateHtmlResponse = require("../middlewares/decorateHtmlResponse");
const avatarUpload = require("../middlewares/users/avatarUpload");
const {
  addUserValidators,
  addUserValidationHandler,
} = require("../middlewares/users/userValidators");
// get users page
router.get("/", decorateHtmlResponse("Users"), authenticated, getUsers);

router.post(
  "/",
  authenticated,
  avatarUpload,
  addUserValidators,
  addUserValidationHandler,
  addUser
);

router.delete("/:id", authenticated, deleteUser);

module.exports = router;
