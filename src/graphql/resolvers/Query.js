const { authenticateUser } = require("../../middleware/Authentication");
const models = require("../../DB/database");
const Chats = require("../../chatSchema/chats");
const { Op } = require("sequelize");
require("dotenv").config();
const { JWT_SECRET } = process.env;

module.exports = {
  user: async (_, args, context) => {
    const userData = authenticateUser(context);
    try {
      const user = await models.User.findOne({
        where: { id: userData.userId },
        include: [
          {
            model: models.Tweet,
            required: false,
          },
        ],
        nest: true,
        subQuery: true,
      });

      return user;
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

  getUserByName: async (_, { username }, context) => {
    const userData = authenticateUser(context);
    try {
      const user = await models.User.findOne({
        where: {
          firstName: username.split("_")[0],
          lastName: username.split("_")[1],
          id: username.split("_")[2],
        },
        include: [
          {
            model: models.Tweet,
            required: false,
          },
        ],
      });
      if (!user) {
        return new Error(`User with username ${username} does not exist`);
      }
      const userConnection = await models.Friend.findOne({
        where: {
          [Op.or]: [
            { requesterId: userData.userId, friendId: user.id },
            { friendId: userData.userId, requesterId: user.id },
          ],
        },
      });
      user["friendship"] =
        userConnection != null ? userConnection.friendship : false;
      return user;
    } catch (error) {
      console.log("error", error.message);
      return error.message;
    }
  },

  getAllUsers: async (_, {}, context) => {
    const userData = authenticateUser(context);
    try {
      const users = await models.User.findAll({
        where: {
          activated: true,
          [Op.not]: { id: userData.userId },
        },
      });
      const userConnectionS = await models.Friend.findAll({
        where: {
          [Op.or]: [
            { requesterId: userData.userId },
            { friendId: userData.userId },
          ],
          friendship: true,
          blocked: false,
        },
      });

      users.map((user) => {
        if (userConnectionS.length == 0) {
          user["friendship"] = false;
          user["blocked"] = false;
        } else {
          userConnectionS.map((userConnection) => {
            if (
              user.id === userConnection.friendId ||
              user.id === userConnection.requesterId
            ) {
              user["friendship"] = userConnection.friendship;
              user["blocked"] = userConnection.blocked;
            } else {
              user["friendship"] = false;
              user["blocked"] = false;
            }
          });
        }
      });
      return users;
    } catch (error) {
      return error.message;
    }
  },

  connectedFriends: async (_, {}, context) => {
    const userData = authenticateUser(context);
    try {
      const users = await models.User.findAll({
        where: {
          activated: true,
        },
      });

      const userConnectionS = await models.Friend.findAll({
        where: {
          [Op.or]: [
            { requesterId: userData.userId },
            { friendId: userData.userId },
          ],
          friendship: true,
          blocked: false,
        },
      });

      const chats = await Chats.find({
        $or: [{ senderId: userData.userId }, { receiverId: userData.userId }],
      }).sort({ createdAt: -1 });

      const friends = [];
      const messages = [];
      users.filter((u) => {
        if (userConnectionS.length > 0) {
          userConnectionS.map((f) => {
            if (chats.length > 0) {
              chats.map((chat) => {
                if (chat.friendshipId == f.id) {
                  messages.push(chat);
                }
              });
            }
            if (
              u.id !== userData.userId &&
              (u.id === f.requesterId || u.id === f.friendId)
            ) {
              let lastMsg;
              if (messages.length > 0) {
                lastMsg = messages.filter(
                  (m) => m.senderId === u.id || m.receiverId === u.id
                );
                lastMsg = lastMsg[lastMsg.length - 1].message;
              }

              friends.push({
                friend: f,
                userId: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                imgUrl: u.imgUrl,
                headline: u.headline,
                isLoggedIn: u.isLoggedIn,
                username: `${u.firstName}_${u.lastName}_${u.id}`,
                lastMessage: lastMsg ? lastMsg : "",
              });
            }
          });
        }
      });
      return friends;
    } catch (error) {
      return error.message;
    }
  },

  tweets: async (_, args, context) => {
    authenticateUser(context);
    try {
      const tweet = await models.Tweet.findAll({
        // where: { UserId: id },
        include: [
          {
            model: models.Comment,
            required: false,
            order: [["createdAt", "ASC"]],
            include: [models.User],
          },
          {
            model: models.User,
            required: false,
            order: [["createdAt", "ASC"]],
          },
          {
            model: models.Like,
            required: false,
            order: [["createdAt", "ASC"]],
          },
        ],
        nest: true,
        order: [["createdAt", "DESC"]],
      });
      return tweet;
    } catch (error) {
      return new Error(error.message);
    }
  },
  tweet: async (_, { TweetId }, context) => {
    // authenticateUser(context);
    try {
      const tweet = await models.Tweet.findOne({
        where: { id: TweetId },
        include: [
          {
            model: models.Comment,
            required: false,
            order: [["createdAt", "ASC"]],
            include: [models.User],
          },
          {
            model: models.User,
            required: false,
            order: [["createdAt", "ASC"]],
          },
          {
            model: models.Like,
            required: false,
            order: [["createdAt", "ASC"]],
          },
        ],
        nest: true,
        order: [["createdAt", "ASC"]],
      });
      return tweet;
    } catch (error) {
      return new Error(error.message);
    }
  },

  tweetComments: async (_, { TweetId }, context) => {
    authenticateUser(context);
    console.log("TweetId", TweetId);
    try {
      const comment = await models.Comment.findAll({
        where: { TweetId: TweetId },
        include: [{ model: models.User, required: false }],
        order: [["createdAt", "ASC"]],
        nest: true,
      });
      return comment;
    } catch (error) {
      return error.message;
    }
  },
  comments: async (_, args, context) => {
    const userData = authenticateUser(context);
    try {
      const comment = await models.Comment.findAll({
        where: { UserId: userData.userId },
        include: [
          { model: models.User, required: false },
          { model: models.Tweet, required: false },
        ],
        order: [["createdAt", "DESC"]],
        nest: true,
      });
      return comment;
    } catch (error) {
      return error.message;
    }
  },
  likes: async (_, args, context) => {
    const userData = authenticateUser(context);
    if (!userData.userId) {
      return new Error("user not authenticated");
    }

    try {
      const likes = await models.Like.findAll({
        where: { UserId: userData.userId },
        order: [["createdAt", "DESC"]],
      });
      if (likes) {
        return likes;
      }
      return "No likes found";
    } catch (error) {
      return error;
    }
  },
  chats: async (_, { friendshipId }, context) => {
    const userData = authenticateUser(context);
    if (!userData.userId) {
      return new Error("user not authenticated");
    }
    try {
      const chats = await Chats.find({ friendshipId: friendshipId });
      return chats;
    } catch (error) {
      return error;
    }
  },
};
