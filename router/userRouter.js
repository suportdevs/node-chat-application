// external imports
const express = require("express");
const router = express.Router();
const { getUser } = require("../controllers/userController");

// internal imports

router.get("/", getUser);

module.exports = router;
