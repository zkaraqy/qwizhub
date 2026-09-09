const dotenv = require("dotenv");
dotenv.config();

module.exports = async () => {
    return {
        dialect: "postgres",
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    };
};
