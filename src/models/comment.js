"use strict";
const sequelize = require("../DB/connection");
const { DataTypes } = require("sequelize");

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    TweetId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    comment: {
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

module.exports = Comment;
