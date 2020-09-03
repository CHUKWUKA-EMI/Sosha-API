const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const { DEV_DATABASE_URL } = process.env;

const sequelize = new Sequelize(DEV_DATABASE_URL, {
  dialect: "postgres",
  host: "lallah.db.elephantsql.com",
  define: {
    freezeTableName: true,
  },
});

module.exports = sequelize;
