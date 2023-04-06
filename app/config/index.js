const config = { 
    app: { 
        port: process.env.PORT, 
    },
    db: {
        uri: process.env.MONGODB_URI
    },
    JWT_Secret:process.env.JWT_Secret,
};

module.exports = config;
