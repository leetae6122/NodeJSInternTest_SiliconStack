const config = { 
    app: { 
        port: process.env.PORT, 
    },
    db: {
        uri: process.env.MONGODB_URI,
    },
    JWT_Secret:process.env.JWT_Secret,
    auth:{
        google:{
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        },
        facebook:{
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET
        }
    },
    mailer:{
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS
    }
};

module.exports = config;
