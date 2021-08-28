const models = require("../../DB/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateUser } = require("../../middleware/Authentication");
const { PubSub } = require("graphql-yoga");
const { sendEmail } = require("../../services/email");
const emailTemplate = require("../../emailTemplate/template");
const { Op } = require("sequelize");
require("dotenv").config();

const pubsub = new PubSub();
module.exports = {
  createUser: async (root, args) => {
    const { firstName, lastName, email, password, phone, birthdate } = args;
    try {
      const existingUser = await models.User.findOne({
        where: { email: email },
      });
      if (existingUser) {
        return new Error("User already exists");
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
      const message = emailTemplate(user);
      await sendEmail(
        `Developer-Justice <pistischaris494@gmail.com>`,
        email,
        "Email Confirmation",
        message
      );
      return user;
    } catch (error) {
      return error;
    }
  },

  login: async (root, { email, password }, context) => {
    try {
      const user = await models.User.findOne({ where: { email: email } });
      if (!user) {
        return new Error("User not found");
      }
      const validPswd = await bcrypt.compare(password, user.password);
      if (!validPswd) {
        return new Error("Invalid password");
      }
      const isActivated = user.activated;
      if (!isActivated) {
        return new Error("Account not verified");
      }
      const { JWT_SECRET, JWT_EXPIRESIN } = process.env;

      const token = jwt.sign(
        { userId: user.id, userName: user.firstName + " " + user.lastName },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRESIN,
        }
      );
      context.response.cookie("Authorization", token, {
        // httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
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
    const userData = authenticateUser(context);
    if (!userData.userId) {
      return new Error("user not authenticated");
    }
    try {
      const user = await models.User.findOne({
        where: { id: userData.userId },
      });
      if (!user) {
        return new Error("user not found");
      }
      const updatedUser = await user.update(args);
      return updatedUser;
    } catch (error) {
      return error;
    }
  },
  createTweet: async (root, { content, imgUrl }, context) => {
    const userData = authenticateUser(context);

    try {
      const tweet = await models.Tweet.create({
        UserId: userData.userId,
        content: content,
        imgUrl,
      });
      context.pubsub.publish("newTweet", { newTweet: tweet });
      return tweet;
    } catch (error) {
      return error;
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
      console.log(error);
      return error.message;
    }
  },
  createComment: async (root, { TweetId, comment }, context) => {
    const userData = authenticateUser(context);
    try {
      const tweet = await models.Tweet.findOne({ where: { id: TweetId } });
      if (!tweet) {
        return new Error("Tweet not found");
      }
      const commented = await models.Comment.create({
        TweetId: TweetId,
        comment: comment,
        UserId: userData.userId,
      });
      await context.pubsub.publish("newComment", {
        newComment: commented,
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
      return new Error("Comment cannot be deleted");
    } catch (error) {
      return error.message;
    }
  },
  like: async (root, { TweetId }, context) => {
    const userData = authenticateUser(context);

    if (!userData.userId) {
      return new Error("User not Authenticated");
    }
    try {
      const tweet = await models.Tweet.findOne({ where: { id: TweetId } });
      if (!tweet) {
        return new Error("Tweet not found");
      }

      const userLikes = await models.Like.findOne({ where: { TweetId } });
      if (userLikes) {
        // const value = userLikes.value === true ? false : true;
        // const yourLike = await userLikes.update({ value });
        await models.Like.destroy({ where: { TweetId } });
        return "tweet disliked";
      } else {
        const newLike = await models.Like.create({
          value: true,
          TweetId: TweetId,
          UserId: userData.userId,
        });
        context.pubsub.publish("newLike", { newLike: newLike, TweetId });
        return "tweet liked";
      }
    } catch (error) {
      console.log("error", error);
      return `We couldn't process your request. Please retry.\n HINT: ${error}`;
    }
  },

  createChat: async (
    root,
    { receiverId, friendshipId, receiverName, message },
    context
  ) => {
    const userData = authenticateUser(context);
    if (!userData.userId) {
      return new Error("user not authenticated");
    }

    try {
      const friendship = await models.Friend.findOne({
        where: {
          id: friendshipId,
        },
      });
      if (!friendship) {
        return new Error(
          "This user is not your friend. Send him/her a friend request, so you can connect to each other."
        );
      }

      const chat = await models.Chat.create({
        friendshipId: friendship.id,
        senderId: userData.userId,
        senderName: userData.userName,
        receiverId: receiverId,
        receiverName: receiverName,
        message: message,
      });
      context.pubsub.publish("newChat", {
        newChat: chat,
        friendshipId,
      });

      return chat;
    } catch (error) {
      console.log("error", error);
      return `We couldn't process your request. Please retry.\n HINT: ${error}`;
    }
  },
  userTyping: async (root, { receiverId }, context) => {
    const UserId = authenticateUser(context);
    if (!UserId) {
      return new Error("user not authenticated");
    }
    try {
      context.pubsub.publish("userTyping", {
        userTyping: true,
        receiverId,
      });
      return true;
    } catch (error) {
      console.log("error", error);
      return `We couldn't process your request. Please retry.\n HINT: ${error}`;
    }
  },

  sendFriendRequest: async (root, { friendId }, context) => {
    const userData = authenticateUser(context);

    if (friendId === userData.userId) {
      return new Error("You cannot send a friend request to yourself");
    }

    try {
      const existingRequest = await models.Friend.findOne({
        where: { requesterId: userData.userId, friendId: friendId },
      });

      if (existingRequest) {
        return new Error("You already have a friend request pending");
      }
      const friend = await models.User.findOne({ where: { id: friendId } });
      if (!friend) {
        return new Error("User not found");
      }
      const friendRequest = await models.Friend.create({
        requesterId: userData.userId,
        friendId: friend.id,
      });
      context.pubsub.publish("newFriendRequest", {
        newFriendRequest: friendRequest,
        friendId,
      });
      return friendRequest;
    } catch (error) {
      console.log("error", error);
      return `We couldn't process your request. Please retry.\n HINT: ${error}`;
    }
  },

  acceptFriendRequest: async (root, { requesterId }, context) => {
    const userData = authenticateUser(context);
    try {
      const request = await models.Friend.findOne({
        where: { friendId: userData.userId, requesterId: requesterId },
      });

      if (!request) {
        return new Error("Friend request not found");
      }
      const accept = await models.Friend.update(
        {
          friendship: true,
          requeststatus: "accepted",
        },
        { where: { friendId: userData.userId, requesterId: requesterId } }
      );

      if (accept) {
        context.pubsub.publish("acceptFriendRequest", {
          acceptFriendRequest: request,
          requesterId,
        });
        return request;
      }

      return new Error("Friend request could not be accepted. Please retry");
    } catch (error) {
      console.log("error", error);
      return `We couldn't process your request. Please retry.\n HINT: ${error}`;
    }
  },

  rejectFriendRequest: async (root, { requesterId }, context) => {
    const userData = authenticateUser(context);
    try {
      const request = await models.Friend.findOne({
        where: { friendId: userData.userId, requesterId: requesterId },
      });

      if (!request) {
        return new Error("Friend request not found");
      }
      const reject = await models.Friend.destroy({
        where: { friendId: userData.userId, requesterId: requesterId },
      });

      if (reject) {
        return "Friend reguest rejected";
      }

      return new Error("Friend request could not be rejected. Please retry");
    } catch (error) {
      console.log("error", error);
      return `We couldn't process your request. Please retry.\n HINT: ${error}`;
    }
  },

  blockFriend: async (root, { userId }, context) => {
    const userData = authenticateUser(context);
    try {
      const friend = await models.Friend.findOne({
        where: {
          [Op.or]: [
            { friendId: userId, requesterId: userData.userId },
            { requesterId: userId, friendId: userData.userId },
          ],
        },
      });

      if (!friend) {
        return new Error("Friend not found");
      }
      const block = await models.Friend.update(
        {
          friendship: true,
          requeststatus: "accepted",
          blocked: true,
        },
        {
          where: {
            [Op.or]: [
              { friendId: userId, requesterId: userData.userId },
              { requesterId: userId, friendId: userData.userId },
            ],
          },
        }
      );

      if (block) {
        return "Friend blocked";
      }

      return new Error("Friend could not be blocked. Please retry");
    } catch (error) {
      console.log("error", error);
      return `We couldn't process your request. Please retry.\n HINT: ${error}`;
    }
  },

  unblockFriend: async (root, { userId }, context) => {
    const userData = authenticateUser(context);
    try {
      const friend = await models.Friend.findOne({
        where: {
          [Op.or]: [
            { friendId: userId, requesterId: userData.userId },
            { requesterId: userId, friendId: userData.userId },
          ],
        },
      });

      if (!friend) {
        return new Error("Friend not found");
      }
      const unblock = await models.Friend.update(
        {
          friendship: true,
          requeststatus: "accepted",
          blocked: false,
        },
        {
          where: {
            [Op.or]: [
              { friendId: userId, requesterId: userData.userId },
              { requesterId: userId, friendId: userData.userId },
            ],
          },
        }
      );

      if (unblock) {
        return "Friend unblocked";
      }

      return new Error("Friend could not be unblocked. Please retry");
    } catch (error) {
      console.log("error", error);
      return `We couldn't process your request. Please retry.\n HINT: ${error}`;
    }
  },

  unFriend: async (root, { userId }, context) => {
    const userData = authenticateUser(context);
    try {
      const friend = await models.Friend.findOne({
        where: {
          [Op.or]: [
            { friendId: userId, requesterId: userData.userId },
            { requesterId: userId, friendId: userData.userId },
          ],
        },
      });

      if (!friend) {
        return new Error("Friend not found");
      }
      const unfriend = await models.Friend.destroy({
        where: {
          [Op.or]: [
            { friendId: userId, requesterId: userData.userId },
            { requesterId: userId, friendId: userData.userId },
          ],
        },
      });

      if (unfriend) {
        return "Friend unfriended";
      }

      return new Error("Friend could not be unfriended. Please retry");
    } catch (error) {
      console.log("error", error);
      return `We couldn't process your request. Please retry.\n HINT: ${error}`;
    }
  },
};
