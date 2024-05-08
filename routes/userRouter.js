const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.send("users");
});

module.exports = router;
