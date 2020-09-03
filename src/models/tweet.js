"use strict";
const sequelize = require("../DB/connection");
const { DataTypes } = require("sequelize");

const Tweet = sequelize.define(
  "Tweet",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {}
);

module.exports = Tweet;
