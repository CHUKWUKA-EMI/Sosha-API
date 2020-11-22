const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const { DEV_DATABASE_URL, LOCAL_DB } = process.env;

const sequelize = new Sequelize(DEV_DATABASE_URL, {
  dialect: "postgres",
  host: "lallah.db.elephantsql.com",
  define: {
    freezeTableName: true,
  },
});
// const sequelize = new Sequelize(LOCAL_DB,{
//   dialect:'postgres',
//   host:'localhost',
//   define:{
//     freezeTableName:true
//   }
// })

module.exports = sequelize;
