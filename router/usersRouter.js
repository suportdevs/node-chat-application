// external imports
const router = require("express").Router();

// internal imports
const { getUsers } = require("../controllers/UsersController");
// get users page
router.get("/", getUsers);

module.exports = router;
