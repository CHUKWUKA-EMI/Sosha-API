"use strict";
const sequelize = require("../DB/connection");
const { DataTypes } = require("sequelize");

const Follow = sequelize.define(
  "friend",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    requesterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    friendId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    friendship: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    requeststatus: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {}
);
module.exports = Follow;
