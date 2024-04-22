// External imports
const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.render("index", {
    title: "Login - Chat Application",
  });
});

router.get("/register", (req, res, next) => {
  res.render("register", {
    title: "Register - Chat Application",
  });
});

module.exports = router;
