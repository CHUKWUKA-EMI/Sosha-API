"use strict";
const sequelize = require("../DB/connection");
const { DataTypes } = require("sequelize");

const User = sequelize.define(
  "User",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: {
          msg: "name cannot be less than thhree characters",
          args: [3],
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: {
          msg: "Password length must be at least 6",
          args: [6],
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthdate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {}
);

module.exports = User;
