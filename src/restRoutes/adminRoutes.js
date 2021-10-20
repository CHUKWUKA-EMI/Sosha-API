const { Router } = require("express");
const models = require("../DB/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../services/email");
const ImageKit = require("imagekit");
const { Op } = require("sequelize");
require("dotenv").config();

const route = Router();

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

route.get("/users", async (req, res) => {
  console.log("user", req.user);
  if (req.user.user_role !== "admin") {
    return res
      .status(403)
      .json("You are not authorized to access this resource");
  }

  try {
    const users = await models.User.findAndCountAll();
    return res.status(200).json({ users: users.rows, count: users.count });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

route.get("/user/:id", async (req, res) => {
  if (req.user.user_role !== "admin") {
    return res
      .status(403)
      .json("You are not authorized to access this resource");
  }
  try {
    const user = await models.User.findByPk(req.params.id);
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

route.get("/tweets", async (req, res) => {
  const { page, limit } = req.query;
  if (req.user.user_role !== "admin") {
    return res
      .status(403)
      .json("You are not authorized to access this resource");
  }
  try {
    const tweets = await models.Tweet.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit: limit ? Number(limit) : 10,
      offset: page ? Number(page) * Number(limit) : 0,
      include: [
        {
          model: models.User,
          required: false,
        },
      ],
    });

    return res.status(200).json({
      tweets: tweets.rows,
      count: tweets.count,
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

route.delete("/tweet/:id", async (req, res) => {
  const { id } = req.params;
  if (req.user.user_role !== "admin") {
    return res
      .status(403)
      .json("You are not authorized to access this resource");
  }

  try {
    const tweet = await models.Tweet.findOne({ where: { id: id } });
    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }
    //delete tweet's image from imagekit
    if (tweet.imagekit_fileId) {
      imagekit.deleteFile(tweet.imagekit_fileId, function (error, result) {
        if (error) console.log(error);
        else console.log(result);
      });
    }

    const deleteTweet = await models.Tweet.destroy({
      where: { id: id },
    });

    if (deleteTweet) {
      return `${id}`;
    } else {
      return new Error("Unable to delete tweet");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

route.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  if (req.user.user_role !== "admin") {
    return res
      .status(403)
      .json("You are not authorized to access this resource");
  }
  try {
    const user = await models.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    //delete user's image from imagekit
    if (user.imagekit_fileId) {
      imagekit.deleteFile(user.imagekit_fileId, function (error, result) {
        if (error) console.log(error);
        else console.log(result);
      });
    }

    const deleteUser = await models.User.destroy({
      where: { id: id },
    });

    if (deleteUser) {
      return res.status(200).json(id);
    } else {
      return res.status(401).json("Unable to delete user");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

route.put("/user/:id", async (req, res) => {
  if (req.user.user_role !== "admin") {
    return res
      .status(403)
      .json("You are not authorized to access this resource");
  }

  try {
    const user = await models.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateUser = await user.update(req.body);
    if (updateUser) {
      return res.status(200).json(updateUser);
    }
    return res.status(401).json("Unable to update user");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

route.delete("/users", async (req, res) => {
  const ids = req.body.ids;
  if (req.user.user_role !== "admin") {
    return res
      .status(403)
      .json("You are not authorized to access this resource");
  }

  if (!Array.isArray(ids)) {
    return res
      .status(400)
      .json({ message: "Invalid request. Please provide an array of ids" });
  }

  try {
    const users = await models.User.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    if (users.length === 0) {
      return res.status(404).json({ message: "Users not found" });
    }
    //delete users' images from imagekit
    await Promise.all(
      users.map(async (user) => {
        if (user.imagekit_fileId) {
          imagekit.deleteFile(user.imagekit_fileId);
        }
      })
    );
    const usersIds = users.map((user) => user.id);
    const deleteUsers = await models.User.destroy({
      where: { id: { [Op.in]: usersIds } },
    });
    if (deleteUsers) {
      return res.status(200).json({ usersIds });
    }
    return res.status(401).json("Unable to delete users");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

route.delete("/tweets", async (req, res) => {
  const ids = req.body.ids;
  if (req.user.user_role !== "admin") {
    return res
      .status(403)
      .json("You are not authorized to access this resource");
  }

  if (!Array.isArray(ids)) {
    return res
      .status(400)
      .json({ message: "Invalid request. Please provide an array of ids" });
  }

  try {
    const tweets = await models.Tweet.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    if (tweets.length === 0) {
      return res.status(404).json({ message: "Tweets not found" });
    }
    //delete tweets' images from imagekit
    await Promise.all(
      tweets.map(async (tweet) => {
        if (tweet.imagekit_fileId) {
          imagekit.deleteFile(tweet.imagekit_fileId);
        }
      })
    );
    const tweetsIds = tweets.map((tweet) => tweet.id);
    const deleteTweets = await models.Tweet.destroy({
      where: { id: { [Op.in]: tweetsIds } },
    });
    if (deleteTweets) {
      return res.status(200).json({ tweetsIds });
    }
    return res.status(401).json("Unable to delete tweets");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = route;
