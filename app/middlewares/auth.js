const ApiError = require("../api-error");

// Xác minh có phải Admin hay không
exports.verifyAdmin = async (req, res, next) => {
    if (req.user.admin) {
        next();
    } else {
        return next(
            new ApiError(405, "You are not allowed to access")
        );
    }
}

// Xác minh có phải Admin hay là chủ sở hữu hay không
exports.verifyAdminUser = async (req, res, next) => {
    if ((req.user._id).toString() == req.params.id || req.user.admin) {
        next();
    } else {
        return next(
            new ApiError(405, "You are not allowed to access")
        );
    }
}