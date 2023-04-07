const OtpGenerator = require("otp-generator");

class OtpService {
    constructor(client) {
        this.Otp = client.db().collection("otps");
        this.Otp.createIndex( { "expireAt": 1 }, { expireAfterSeconds: 0 } );
    }

    extractOtpData(payload) {
        const otp = {
            email: payload.email,
            otp: payload.otp,
            created_date: payload.created_date,
        };

        Object.keys(otp).forEach(
            (key) => otp[key] === undefined && delete otp[key]
        );

        return otp;
    }

    async findByEmail(email) {
        const cursor = await this.Otp.find({
            email: { $regex: new RegExp(email) },
        }).sort({ "created_date": -1 });
        return await cursor.toArray();
    }

    async deleteAll(email) {
        const result = await this.Otp.deleteMany({
            email: email ? email.toString() : null
        })
        return result.value;
    }

    async create(email) {
        const otp = OtpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
        const createOTP = this.extractOtpData({ email: email, otp: otp });
        const date = Date.now() + 59000; //59s expires
        const result = await this.Otp.findOneAndUpdate(
            createOTP,
            {
                $set: {
                    created_date: new Date(),
                    expireAt: new Date(date),
                }
            },
            { returnDocument: "after", upsert: true }
        );

        return result.value;
    }

}
module.exports = OtpService;