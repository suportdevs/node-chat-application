// external imports
const router = require("express").Router();

// internal imports
const { getUsers } = require("../controllers/UsersController");
const decorateHtmlResponse = require("../middlewares/decorateHtmlResponse");
const avatarUpload = require("../middlewares/users/avatarUpload");
// get users page
router.get("/", decorateHtmlResponse("Users"), getUsers);

router.post("/", avatarUpload);

module.exports = router;
