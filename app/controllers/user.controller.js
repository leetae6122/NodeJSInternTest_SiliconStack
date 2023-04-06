const UserService = require("../services/user.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const userService = new UserService(MongoDB.client);
        const { firstname } = req.query;
        if (firstname) {
            documents = await userService.findByFirstname(firstname);
        } else {
            documents = await userService.find({});
        }
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving the users")
        );
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "User not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving user with id=${req.params.id}`)
        );
    }
};

exports.update = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        if (req.file) {
            const avatar_image = {
                contentType: req.file.mimetype,
                image: req.file.buffer
            };
            const document = await userService.update(req.params.id, { ...req.body, ...avatar_image });
            if (!document) {
                return new (ApiError(404, "User not found"))
            }
            return res.send({ message: "User was update successfully" });
        } else {
            const document = await userService.update(req.params.id, req.body);
            if (!document) {
                return new (ApiError(404, "User not found"))
            }
            return res.send({ message: "User was update successfully" });
        }
    } catch (error) {
        return next(
            new ApiError(500, `Error update user with id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "User not found"));
        }
        return res.send({ message: "User was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete user with id=${req.params.id}`)
        );
    }
};

exports.getImage = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.findById(req.params.id);
        if (!user) {
            return next(new ApiError(404, "User not found"));
        }
        res.contentType(user.avatar_image.contentType);
        res.send(user.avatar_image.image.buffer)
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete user with id=${req.params.id}`)
        );
    }
};

exports.logout = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        await userService.logout(req.user.id);
        res.clearCookie("refreshToken");
        res.send({ message: "Log Out" });
        res.end();
    } catch (error) {
        return next(
            new ApiError(500, `Error logout user with id=${req.user.id}`)
        );
    }
};

// Auth Route
exports.login = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.findByEmail(req.body.email);
        if (!user) return next(new ApiError(404, "Wrong email"));

        const validpassword = await userService.validPassword(req.body.password, user.password)
        if (!validpassword) return next(new ApiError(404, "Wrong password"));
        if (user && validpassword) {
            const accessToken = await userService.login(user, "4h");
            const refreshToken = await userService.login(user, "1d");
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });
            return res.send({
                userid: user._id,
                AccessToken: accessToken
            });
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while logging the user")
        );
    }
}

exports.signup = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        if (req.file) {
            console.log('run1');
            const avatar_image = {
                contentType: req.file.mimetype,
                image: req.file.buffer
            };
            const document = await userService.create({ ...req.body, ...avatar_image });
            if (!document) {
                return next(new ApiError(404, "User not found"));
            }
            return res.send(document);
        } else {
            const document = await userService.create(req.body);
            if (!document) {
                return next(new ApiError(404, "User not found"))
            }

            return res.send(document);
        }
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, "An error occurred while creating the user")
        );
    }
}


exports.refreshToken = async (req, res, next) => {
    const jwt = require("jsonwebtoken");
    const config = require("../config");
    
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return next(
        new ApiError(401, "You're not authenticated")
    );
    const userService = new UserService(MongoDB.client);
    jwt.verify(refreshToken, config.JWT_Secret, async (error, user) => {
        if (error) return next(
            new ApiError(401, "Token is not valid")
        );
        const newAccessToken = await userService.refresh(user, "4h");
        const newRefreshToken = await userService.refresh(user, "1d");
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict",
        });

        return res.send({
            userid: user.id,
            AccessToken: newAccessToken
        });
    })
}