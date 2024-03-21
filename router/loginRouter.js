// external imports
const router = require("express").Router();

// internal imports
const { getLogin } = require("../controllers/loginController");

router.get("/", getLogin);

module.exports = router;
