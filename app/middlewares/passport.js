const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const config = require("../config");
const UserService = require("../services/user.service");
const MongoDB = require("../utils/mongodb.util");

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

//Json Web Token
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
    secretOrKey: config.JWT_Secret
}, async (payload, done) => {
    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.findById(payload.id);
        if (!user) return done(null, false);
        done(null, user);
    } catch (error) {
        done(error, false)
    }
}));

//Passport Google
passport.use(new GoogleStrategy({
    clientID: config.auth.google.clientID,
    clientSecret: config.auth.google.clientSecret,
    callbackURL: "http://localhost:3000/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.findByEmailauthType(profile.emails[0].value,profile.provider);
        if (user) return done(null, user);
        const payload = {
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            email: profile.emails[0].value,
            authType: profile.provider
        }
        const newUser = await userService.create(payload);
        done(null, newUser);
    } catch (error) {
        done(error, false)
    }
}));

//Passport Facebook
passport.use(new FacebookStrategy({
    clientID: config.auth.facebook.clientID,
    clientSecret: config.auth.facebook.clientSecret,
    callbackURL: "http://localhost:3000/api/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.findByEmailauthType(profile.emails[0].value,profile.provider);
        if (user) return done(null, user);
        const payload = {
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            email: profile.emails[0].value,
            authType: profile.provider
        }
        const newUser = await userService.create(payload);
        done(null, newUser);
    } catch (error) {
        done(error, false)
    }
}));
