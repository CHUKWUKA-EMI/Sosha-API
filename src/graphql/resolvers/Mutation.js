const models = require("../../DB/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateUser } = require("../../middleware/Authentication");
const { response } = require("express");
require("dotenv").config();

module.exports = {
  createUser: async (root, args) => {
    const { firstName, lastName, email, password, phone, birthdate } = args;
    try {
      const existingUser = await models.User.findOne({
        where: { email: email },
      });
      if (existingUser) {
        throw new Error("User already exists");
      }
      const hashedPswd = await bcrypt.hash(password, 10);
      const user = await models.User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPswd,
        phone: phone,
        birthdate: new Date(birthdate).toUTCString(),
      });
      return user;
    } catch (error) {
      console.error(error.message);
    }
  },

  login: async (root, { email, password }) => {
    try {
      const user = await models.User.findOne({ where: { email: email } });
      if (!user) {
        throw new Error("User not found");
      }
      const validPswd = await bcrypt.compare(password, user.password);
      if (!validPswd) {
        throw new Error("Invalid password");
      }
      const { JWT_SECRET, JWT_EXPIRESIN } = process.env;

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRESIN,
      });
      return {
        userId: user.id,
        token: token,
        tokenExpiration: JWT_EXPIRESIN,
      };
    } catch (error) {
      console.error(error.message);
    }
  },
  updateProfile: async (root, args, context) => {
    const userId = authenticateUser(context);
    if (!userId) {
      return new Error("user not authenticated");
    }
    try {
      const user = await models.User.findOne({ where: { id: userId } });
      if (!user) {
        return new Error("user not found");
      }
      const updatedUser = await user.update({ args });
      return updatedUser;
    } catch (error) {
      return error;
    }
  },
  createTweet: async (root, { content, imgUrl }, context) => {
    const UserId = authenticateUser(context);

    try {
      console.log(UserId);
      const tweet = await models.Tweet.create({
        UserId: UserId,
        content: content,
        imgUrl,
      });
      return tweet;
    } catch (error) {
      return error.message;
    }
  },

  updateTweet: async (root, { id, content, imgUrl }, context) => {
    authenticateUser(context);
    try {
      const tweet = await models.Tweet.findOne({ where: { id: id } });
      if (tweet) {
        const updatedTweet = await tweet.update({ content: content, imgUrl });
        return updatedTweet;
      }
      return new Error("Tweet not found");
    } catch (error) {
      return error.message;
    }
  },
  deleteTweet: async (root, { id }, context) => {
    authenticateUser(context);
    try {
      const deleteTweet = await models.Tweet.destroy({
        where: { id: id },
      });
      if (deleteTweet) {
        return "Tweet deleted successfully";
      }
      return new Error("Unable to delete tweet");
    } catch (error) {
      return error.message;
    }
  },
  createComment: async (root, { TweetId, comment }, context) => {
    const UserId = authenticateUser(context);
    try {
      const tweet = await models.Tweet.findOne({ where: { id: TweetId } });
      if (!tweet) {
        return new Error("Tweet not found");
      }
      const commented = await models.Comment.create({
        TweetId: TweetId,
        comment: comment,
        UserId: UserId,
      });
      return commented;
    } catch (error) {
      return new Error(error.message);
    }
  },
  deleteComment: async (root, { id }, context) => {
    authenticateUser(context);
    try {
      const deleted = await models.Comment.destroy({ where: { id: id } });
      if (deleted) {
        return "Comment successfully deleted";
      }
      throw new Error("Comment cannot be deleted");
    } catch (error) {
      return error.message;
    }
  },
  like: async (root, { TweetId }, context) => {
    const UserId = authenticateUser(context);
    if (!UserId) {
      return new Error("User not Authenticated");
    }
    try {
      const tweet = await models.Tweet.findOne({ where: { id: TweetId } });
      if (!tweet) {
        return new Error("Tweet not found");
      }

      const userLikes = await models.Like.findOne({ where: { TweetId } });
      if (userLikes) {
        const value = userLikes.value === true ? false : true;
        const yourLike = await userLikes.update({ value });
        return yourLike;
      } else {
        const newLike = await models.Like.create({
          value: true,
          TweetId: TweetId,
          UserId: UserId,
        });
        return newLike;
      }
    } catch (error) {
      console.log("error", error);
      return error;
    }
  },
  follow: async (root, { targetId }, context) => {
    const UserId = authenticateUser(context);
    if (!UserId) {
      return new Error("User not Authenticated");
    }
    try {
      const user = await models.User.findOne({ where: { id: targetId } });
      if (!user) {
        return new Error("User not found");
      }

      const userFollow = await models.Follow.findOne({ where: { targetId } });
      if (userFollow) {
        const value = userFollow.value === true ? false : true;
        const yourFollow = await userFollow.update({ value });
        return yourFollow;
      } else {
        console.log("model", models.Follow);
        const newFollow = await models.Follow.create({
          UserId: UserId,
          targetId: targetId,
          value: true,
        });
        return newFollow;
      }
    } catch (error) {
      return error;
    }
  },
  createChat: async (root, { receiverId, message }, context) => {
    const UserId = authenticateUser(context);
    if (!UserId) {
      return new Error("user not authenticated");
    }
    console.log("response", response);
    try {
      const chat = await models.Chat.create({
        UserId: UserId,
        receiverId: receiverId,
        message: message,
      });
      return chat;
    } catch (error) {
      return error;
    }
  },
  userTyping: async (root, { receiverId }, context) => {
    const UserId = authenticateUser(context);
    if (!UserId) {
      return new Error("user not authenticated");
    }
    try {
      return true;
    } catch (error) {
      return error;
    }
  },
};
