const {
  block,
  unblock,
  getUsers,
  updateUser,
  userDelete,
} = require("../controllers/userController");
const authenticated = require("../middlewares/authenticated");
const avatarUpload = require("../middlewares/avatarUploader");
const decoratedHtmlResponse = require("../middlewares/decoratedHtmlResponse");

const router = require("express").Router();

router.get("/", decoratedHtmlResponse("Users"), authenticated, getUsers);

router.post("/", authenticated, getUsers);

router.put("/:id", avatarUpload, authenticated, updateUser);

router.post("/block", authenticated, block);

router.post("/unblock", authenticated, unblock);

router.delete("/delete/:id", authenticated, userDelete);

module.exports = router;
