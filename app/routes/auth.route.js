const express = require("express");
const users = require("../controllers/user.controller");
const validation = require("../middlewares/validation");
const upload = require("../middlewares/upload");
const router = express.Router();
const passport = require("passport");
require("../middlewares/passport");

router.route("/login")
    .post(users.login)

router.route("/google")
    .get(passport.authenticate('google', { scope: ['email', 'profile'] }))
router.route("/google/callback")
    .get(passport.authenticate('google', {
        failureRedirect: '/login',
    }), users.login)

router.route("/facebook")
    .get(passport.authenticate('facebook'))
router.route("/facebook/callback")
    .get(passport.authenticate('facebook', {
        failureRedirect: '/login',
    }), users.login)

router.route("/signup")
    .post(upload.single('avatar_image'), validation.signup, users.signup)

router.route("/refresh")
    .post(users.refreshToken)

router.route("/forgot_password")
    .post(users.forgotPassword)
    
router.route("/reset_password")
    .put(validation.resetPassword, users.resetPassword)
module.exports = router;