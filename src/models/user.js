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
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: {
          msg: "name cannot be less than three characters",
          args: [3],
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: {
          msg: "name cannot be less than three characters",
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
    imgUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imagekit_fileId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    activated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    headline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sex: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_verification_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isLoggedIn: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    user_role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
  },
  {}
);

module.exports = User;
