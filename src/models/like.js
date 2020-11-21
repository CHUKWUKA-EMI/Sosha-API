"use strict";
const sequelize = require("../DB/connection");
const { DataTypes } = require("sequelize");

const Like = sequelize.define(
  "Like",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    value: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    TweetId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {}
);

module.exports = Like;
