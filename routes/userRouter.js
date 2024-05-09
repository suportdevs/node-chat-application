const { block, unblock } = require("../controllers/userController");
const authenticated = require("../middlewares/authenticated");

const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.send("users");
});

router.post("/block", authenticated, block);

router.post("/unblock", authenticated, unblock);

module.exports = router;
