const OtpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

class OtpService {
    constructor(client) {
        this.Otp = client.db().collection("otps");
        this.Otp.createIndex({ "expireAt": 1 }, { expireAfterSeconds: 0 });
    }

    extractOtpData(payload) {
        const otp = {
            email: payload.email,
            otp: payload.otp,
            created_date: new Date(),
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

    async sendMail(toMail, otp) {
        const config = require("../config");
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: config.mailer.user,
                pass: config.mailer.pass,
            },
        });
        const info = await transporter.sendMail({
            from: config.mailer.user,
            to: toMail,
            subject: "Reset Password",
            html: `
            <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                    <div style="border-bottom:1px solid #eee">
                    <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">NodeJSTest</a>
                    </div>
                    <p style="font-size:1.1em">Hi,</p>
                    <p>Use the following OTP to complete your Reset Password procedures. OTP is valid for 2 minutes</p>
                    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                    <p style="font-size:0.9em;">Regards,<br />Le Duong Tri</p>
                    <hr style="border:none;border-top:1px solid #eee" />
                    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>Le Duong Tri</p>
                    <p>CanTho</p>
                    </div>
                </div>
            </div>
            `,
        });
        return info;
    }

    async create(email) {
        const otp = OtpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
        const salt = bcrypt.genSaltSync(10);
        const hashOtp = bcrypt.hashSync(otp, salt);

        const createOTP = this.extractOtpData({ email: email, otp: hashOtp });
        const date = Date.now() + 119000; //119s expires
        await this.Otp.findOneAndUpdate(
            createOTP,
            {
                $set: {
                    expireAt: new Date(date),
                }
            },
            { returnDocument: "after", upsert: true }
        );

        return otp;
    }

    async validOtp(otp, hashOtp) {
        return await bcrypt.compare(
            otp,
            hashOtp
        );
    }

}
module.exports = OtpService;