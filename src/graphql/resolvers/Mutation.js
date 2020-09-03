const models = require("../../DB/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateUser } = require("../../middleware/Authentication");
require("dotenv").config();

module.exports = {
  createUser: async (root, args) => {
    const { name, email, password, phone, birthdate } = args;
    try {
      const existingUser = await models.User.findOne({
        where: { email: email },
      });
      if (existingUser) {
        throw new Error("User already exists");
      }
      const hashedPswd = await bcrypt.hash(password, 10);
      const user = await models.User.create({
        name: name,
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
  createTweet: async (root, { UserId, content }, context) => {
    UserId = authenticateUser(context);
    try {
      const tweet = await models.Tweet.create({
        UserId: UserId,
        content: content,
      });
      return tweet;
    } catch (error) {
      return error.message;
    }
  },

  updateTweet: async (root, { id, content }, context) => {
    authenticateUser(context);
    try {
      const tweet = await models.Tweet.findOne({ where: { id: id } });
      if (tweet) {
        const updatedTweet = await tweet.update({ content: content });
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
  createComment: async (root, { TweetId, UserId, comment }, context) => {
    UserId = authenticateUser(context);
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
};
