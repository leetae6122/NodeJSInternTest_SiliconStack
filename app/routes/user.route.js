const express = require("express");
const users = require("../controllers/user.controller");
const auth = require("../middlewares/auth");
const validation = require("../middlewares/validation");
const upload = require("../middlewares/upload");

const router = express.Router();

router.route("/")
    .get(auth.verifyAdmin, users.findAll)
router.route("/logout")
    .get(users.logout)
router.route("/image/:id")
    .get(auth.verifyAdminUser, users.getImage)
router.route("/:id")
    .get(auth.verifyAdminUser, users.findOne)
    .put(auth.verifyAdminUser, upload.single('avatar_image'), validation.update , users.update)
    .delete(auth.verifyAdmin, users.delete)

module.exports = router;