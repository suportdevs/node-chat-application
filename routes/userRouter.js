const { block, unblock, getUsers } = require("../controllers/userController");
const authenticated = require("../middlewares/authenticated");
const decoratedHtmlResponse = require("../middlewares/decoratedHtmlResponse");

const router = require("express").Router();

router.get("/", decoratedHtmlResponse("Users"), authenticated, getUsers);

router.post("/block", authenticated, block);

router.post("/unblock", authenticated, unblock);

module.exports = router;
