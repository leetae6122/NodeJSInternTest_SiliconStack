const express = require("express");
const users = require("../controllers/user.controller");
const validation = require("../middlewares/validation");
const upload = require("../middlewares/upload");
const router = express.Router();

router.route("/login")
    .post(users.login)
router.route("/signup")
    .post(upload.single('avatar_image'), validation.signup, users.signup)
router.route("/refresh")
    .post(users.refreshToken)

module.exports = router;