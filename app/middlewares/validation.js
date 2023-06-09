const validator = require("validator");
const ApiError = require("../api-error");

exports.signup = async (req, res, next) => {
    if (Object.keys(req.body).length === 0 && !(req.file)) {
        return next(new ApiError(400, "Data cannot be empty"));
    }
    try {
        if (!validator.isEmpty(req.body.firstname)) {
            if (!validator.isLength(req.body.firstname, { max: 50 }))
                return next(new ApiError(400, "Firstname has at most 50 characters."));
        } else return next(new ApiError(400, "Firstname cannot be empty."));

        if (!validator.isEmpty(req.body.lastname)) {
            if (!validator.isLength(req.body.lastname, { max: 50 }))
                return next(new ApiError(400, "Lastname has at most 50 characters."));
        } else return next(new ApiError(400, "Lastname cannot be empty."));

        if (!validator.isEmpty(req.body.email)) {
            if (!validator.isEmail(req.body.email))
                return next(new ApiError(400, "Invalid email"));
        } else return next(new ApiError(400, "Email cannot be empty."));

        if (!validator.isEmpty(req.body.password)) {
            if (!validator.isStrongPassword(req.body.password, { minLength: 10 }))
                return next(new ApiError(400, "Weak password"));
        } else return next(new ApiError(400, "Password cannot be empty."));

        if (!validator.isEmpty(req.body.confirm_password)) {
            if (!validator.matches(req.body.confirm_password, req.body.password))
                return next(new ApiError(400, "Confirm password is incorrect"));
        } else return next(new ApiError(400, "Confirm password cannot be empty."));

        if (req.file) {
            const match = ['image/jpeg', 'image/jpg', 'image/png']
            if (req.file.size > (5 * 1024 * 1024))
                return next(new ApiError(400, "File size must be less than 5MB"));
                
            if (match.indexOf(req.file.mimetype) === -1)
                return next(new ApiError(400, "Invalid file"));

        }

        next();
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while logging in the account")
        );
    }
}

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0 && !(req.file)) {
        return next(new ApiError(400, "Data cannot be empty"));
    }
    try {
        if (req.body.firstname) {
            if (!validator.isLength(req.body.firstname, { max: 50 }))
                return next(new ApiError(400, "Firstname has at most 50 characters."));
        }

        if (req.body.lastname) {
            if (!validator.isLength(req.body.lastname, { max: 50 }))
                return next(new ApiError(400, "Lastname has at most 50 characters."));
        }

        if (req.body.email) {
            if (!validator.isEmail(req.body.email))
                return next(new ApiError(400, "Invalid email"));
        }

        if (req.body.password) {
            if (!validator.isStrongPassword(req.body.password, { minLength: 10 }))
                return next(new ApiError(400, "Weak password"));

            if (!req.body.confirm_password)
                return next(new ApiError(400, "Confirm password is not empty"));

            if (!validator.matches(req.body.confirm_password, req.body.password))
                return next(new ApiError(400, "Confirm password is incorrect"));
        }
        if (req.file) {
            const match = ['image/jpeg', 'image/jpg', 'image/png']
            if (req.file.size > (5 * 1024 * 1024))
                return next(new ApiError(400, "File size must be less than 5MB"));

            if (match.indexOf(req.file.mimetype) === -1)
                return next(new ApiError(400, "Invalid file"));
        }

        next();
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while logging in the account")
        );
    }
}

exports.changePassword = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data cannot be empty"));
    }
    try {
        if (validator.isEmpty(req.body.oldpassword))
            return next(new ApiError(400, "Old Password cannot be empty."));

        if (!validator.isEmpty(req.body.newpassword)) {
            if (!validator.isStrongPassword(req.body.newpassword, { minLength: 10 }))
                return next(new ApiError(400, "Weak password"));
        } else return next(new ApiError(400, "New Password cannot be empty."));

        if (!validator.isEmpty(req.body.confirm_newpassword)) {
            if (!validator.matches(req.body.confirm_newpassword, req.body.newpassword))
                return next(new ApiError(400, "Confirm new password is incorrect"));
        } else return next(new ApiError(400, "Confirm new password cannot be empty."));

        next();
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while logging in the account")
        );
    }
}

exports.resetPassword = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data cannot be empty"));
    }
    try {
        if (validator.isEmpty(req.body.email))
            return next(new ApiError(400, "Email cannot be empty."));

        if (validator.isEmpty(req.body.otp))
            return next(new ApiError(400, "OTP cannot be empty."));

        if (!validator.isEmpty(req.body.newpassword)) {
            if (!validator.isStrongPassword(req.body.newpassword, { minLength: 10 }))
                return next(new ApiError(400, "Weak password"));
        } else return next(new ApiError(400, "New Password cannot be empty."));

        if (!validator.isEmpty(req.body.confirm_newpassword)) {
            if (!validator.matches(req.body.confirm_newpassword, req.body.newpassword))
                return next(new ApiError(400, "Confirm new password is incorrect"));
        } else return next(new ApiError(400, "Confirm new password cannot be empty."));
        next();
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, "An error occurred while logging in the account")
        );
    }
}