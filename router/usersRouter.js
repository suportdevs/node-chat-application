// external imports
const router = require("express").Router();

// internal imports
const { getUsers } = require("../controllers/UsersController");
const decorateHtmlResponse = require("../middlewares/decorateHtmlResponse");
// get users page
router.get("/", decorateHtmlResponse("Users"), getUsers);

module.exports = router;
