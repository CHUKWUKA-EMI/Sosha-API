const { authenticateUser } = require("../../middleware/Authentication");
const models = require("../../DB/database");
require("dotenv").config();
const { JWT_SECRET } = process.env;

module.exports = {
  user: async (_, args, context) => {
    const id = authenticateUser(context);
    try {
      const user = await models.User.findOne({
        where: { id: id },
        include: [
          {
            model: models.Tweet,
            required: false,
            include: [{ model: models.Comment, required: false }],
          },
        ],
        raw: true,
        nest: true,
        subQuery: true,
      });

      return { ...user };
    } catch (error) {
      return error.message;
    }
  },
  retrieveUser: async (_, { email, phone, username }) => {
    let user;
    try {
      if (email) {
        user = await models.User.findOne({ where: { email: email } });
        if (!user) {
          throw new Error(`User with email ${email} does not exist`);
        }
        return user;
      } else if (phone) {
        user = await models.User.findOne({ where: { phone: phone } });
        if (!user) {
          throw new Error(`User with phone number ${phone} does not exist`);
        }
        return user;
      } else {
        user = await models.User.findOne({ where: { username: username } });
        if (!user) {
          throw new Error(`User with username ${username} does not exist`);
        }
        return user;
      }
    } catch (error) {
      console.error(error.message);
      return error.message;
    }
  },
  tweets: async (_, args, context) => {
    const id = authenticateUser(context);
    try {
      const tweet = await models.Tweet.findOne({
        where: { UserId: id },
        include: [
          { model: models.Comment, required: false },
          { model: models.User, required: false },
        ],
        nest: true,
        raw: true,
      });
      return tweet;
    } catch (error) {
      return new Error(error.message);
    }
  },
  comments: async (_, args, context) => {
    const id = authenticateUser(context);
    try {
      const comment = await models.Comment.findOne({
        where: { UserId: id },
        include: [
          { model: models.User, required: false },
          { model: models.Tweet, required: false },
        ],
        raw: true,
        nest: true,
      });
      return comment;
    } catch (error) {
      return error.message;
    }
  },
};
