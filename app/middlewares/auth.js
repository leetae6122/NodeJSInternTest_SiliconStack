const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../api-error");

// Xác minh Token
exports.verifyToken = async (req, res, next) => {
    try {
        const authHeader = await req.header('Authorization');
        if (!authHeader) return next(new ApiError(400, "You're not authoticated"));
        const baerer = await authHeader.split(' ')[0];
        const token = await authHeader.split(' ')[1];

        if (token && baerer == "Bearer") {
            jwt.verify(token, config.JWT_Secret, (error, user) => {
                if (error) return next(new ApiError(400, "Token is not valid"));
                req.user = user;
                next();
            });
        } else {
            return next(new ApiError(400, "You're not authoticated"));
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while logging in the user")
        );
    }
}

// Xác minh có phải Admin hay không
exports.verifyAdmin = async (req, res, next) => {
    if (req.user.admin) {
        next();
    } else {
        return next(
            new ApiError(400, "You are not allowed to access")
        );
    }
}

// Xác minh có phải Admin hay là chủ sở hữu hay không
exports.verifyAdminUser = async (req, res, next) => {
    if (req.user.id == req.params.id || req.user.admin) {
        next();
    } else {
        return next(
            new ApiError(400, "You are not allowed to access")
        );
    }
}