"use strict";
const sequelize = require("../DB/connection");
const { DataTypes } = require("sequelize");

const passwordReset = sequelize.define(
  "password-resets",
  {
    userId: DataTypes.UUID,
    token: DataTypes.STRING,
  },
  {}
);
module.exports = passwordReset;
