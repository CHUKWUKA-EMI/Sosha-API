"use strict";
const sequelize = require("../DB/connection");
const { DataTypes } = require("sequelize");

const Chat = sequelize.define(
  "Chat",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    friendshipId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    senderName: {
      type: DataTypes.STRING,
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receiverName: {
      type: DataTypes.STRING,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {}
);
module.exports = Chat;
