require("dotenv").config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    host: "lallah.db.elephantsql.com",
    dialect: "postgres",
    operatorsAliases: 1,
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorsAliases: false,
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorsAliases: false,
  },
};
