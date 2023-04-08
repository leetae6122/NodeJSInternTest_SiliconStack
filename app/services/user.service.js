const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");

class UserService {
    constructor(client) {
        this.User = client.db().collection("users");
    }

    extractUserData(payload) {
        const user = {
            firstname: payload.firstname,
            lastname: payload.lastname,
            email: payload.email,
            password: payload.password,
            avatar_image: {
                contentType: payload.contentType,
                image: payload.image
            },
            authType: payload.authType
        };

        Object.keys(user).forEach(
            (key) => user[key] === undefined && delete user[key]
        );

        Object.keys(user.avatar_image).forEach(
            (key) => user.avatar_image[key] === undefined && delete user.avatar_image[key]
        );
        if (Object.keys(user.avatar_image).length == 0) { delete user.avatar_image }

        return user;
    }

    async find(filter) {
        const cursor = await this.User.find(filter);
        return await cursor.toArray();
    }

    async findByFirstname(firstname) {
        const cursor = await this.User.find({
            firstname: { $regex: new RegExp(firstname), $options: "i" },
        });
        return await cursor.toArray();
    }

    async findByEmail(email) {
        return await this.User.findOne({
            email: { $regex: new RegExp(email) },
        });
    }

    async findByEmailauthType(email, authType) {
        return await this.User.findOne({
            email: { $regex: new RegExp(email) },
            authType: { $regex: new RegExp(authType) },
        });
    }

    async findById(id) {
        return await this.User.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        })
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        }
        const salt = bcrypt.genSaltSync(10);
        const passwordHashed = bcrypt.hashSync(payload.password, salt);
        const update = this.extractUserData(payload);
        const result = await this.User.findOneAndUpdate(
            filter,
            {
                $set: {
                    ...update,
                    password: passwordHashed
                }
            },
            { returnDocument: "after" }
        );
        return result.value;
    }

    async delete(id) {
        const result = await this.User.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        })
        return result.value;
    }

    async create(payload) {
        const user = this.extractUserData(payload);
        if (payload.password) {
            const salt = bcrypt.genSaltSync(10);
            const passwordHashed = bcrypt.hashSync(user.password, salt);
            const result = await this.User.findOneAndUpdate(
                user,
                {
                    $set: {
                        admin: false,
                        password: passwordHashed
                    }
                },
                { returnDocument: "after", upsert: true }
            );
            return result.value;
        }else{
            const result = await this.User.findOneAndUpdate(
                user,
                {
                    $set: {
                        admin: false,
                    }
                },
                { returnDocument: "after", upsert: true }
            );
            return result.value;
        }

    }

    async logout(id) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = { online: false };
        await this.User.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
    }

    // Auth
    async login(payload, time) {
        const filter = {
            _id: ObjectId.isValid(payload._id) ? new ObjectId(payload._id) : null,
        };
        const update = { online: true };
        await this.User.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );

        return jwt.sign({
            iss: 'Le Duong Tri',
            id: payload._id,
            admin: payload.admin
        }, config.JWT_Secret, {
            expiresIn: time
        })
    }

    async refresh(payload, time) {
        return jwt.sign({
            iss: 'Le Duong Tri',
            id: payload.id,
            admin: payload.admin
        }, config.JWT_Secret, {
            expiresIn: time
        })
    }

    async validPassword(confirmed_password, password) {
        return await bcrypt.compare(
            confirmed_password,
            password
        );
    }

}
module.exports = UserService;