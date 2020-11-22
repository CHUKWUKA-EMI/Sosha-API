"use strict";
const sequelize = require("../DB/connection");
const { DataTypes } = require("sequelize");

const activationTokens = sequelize.define(
  "activation-tokens",
  {
    userId: DataTypes.UUID,
    token: DataTypes.STRING,
  },
  {}
);
module.exports = activationTokens;
