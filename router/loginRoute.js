// external imports
const express = require("express");
const router = express.Router();
const { getLogin } = require("../controllers/loginController");

// internal imports

router.get("/", getLogin);

module.exports = router;
