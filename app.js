require('dotenv').config()

const express = require("express");
const session = require('express-session')
const cors = require("cors");
const ApiError = require("./app/api-error");

const passport = require("passport");
require("./app/middlewares/passport");
const usersRouter = require("./app/routes/user.route");
const authRouter = require("./app/routes/auth.route");

const app = express();
const cookieParser = require('cookie-parser');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());


app.get("/", (req, res) => {
    res.json({ message: "Small Test for NodeJS Intern Position." });
});

app.use("/api/auth", authRouter);
app.use("/api/users", passport.authenticate('jwt', { session: false }), usersRouter);

// handle 404 response 
app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

//define error-handling middleware last, after other app.use() and routes calls 
app.use((error, req, res, next) => {
    return res.status(error.statusCode || 500).json({
        message: error.message || "Internal Server Error",
    });
});

module.exports = app;