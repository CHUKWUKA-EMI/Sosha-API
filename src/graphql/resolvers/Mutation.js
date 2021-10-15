const models = require("../../DB/database");
const Chats = require("../../chatSchema/chats");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateUser } = require("../../middleware/Authentication");
const { sendEmail } = require("../../services/email");
const emailTemplate = require("../../emailTemplate/template");
// const { sendSMS } = require("../../services/sms");
const { validatePhoneNumber } = require("../../utils/phoneValidator");
const { Op } = require("sequelize");
const ImageKit = require("imagekit");
require("dotenv").config();

//Imagekit Params
const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

module.exports = {
  createUser: async (root, args) => {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      country,
      state,
      region_code,
      birthdate,
    } = args;

    const phoneValidate = validatePhoneNumber(phone, region_code.toUpperCase());
    if (phoneValidate.status === false) {
      return new Error(phoneValidate.message);
    }

    try {
      const existingUser = await models.User.findOne({
        where: { email: email },
      });
      if (existingUser) {
        return new Error("User already exists");
      }

      const hashedPswd = await bcrypt.hash(password, 10);
      // let code = Math.random() * 10000;
      // code = code.toString().split(".")[0];
      const phoneNumber = phoneValidate.message.replace(/ /g, "");
      const user = await models.User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPswd,
        phone: phoneNumber,
        birthdate: new Date(birthdate).toUTCString(),
        country: country,
        state: state,
      });
      const message = emailTemplate(user);

      await Promise.all([
        sendEmail(
          `Admin<${process.env.SUPPORT_EMAIL}>`,
          email,
          "Email Confirmation",
          message
        ),
        // sendSMS({
        //   to: phoneNumber,
        //   message: `Your verification code is ${code}`,
        // }),
      ]);
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
  createTweet: async (
    root,
    { content, imgUrl, userId, imagekit_fileId },
    context
  ) => {
    const userData = authenticateUser(context);

    try {
      const user = await models.User.findOne({ where: { id: userId } });
      const tweet = await models.Tweet.create({
        UserId: userData.userId,
        content: content,
        imgUrl,
        imagekit_fileId,
      });
      const responseBody = {
        id: tweet.id,
        content: tweet.content,
        imgUrl: tweet.imgUrl,
        imagekit_fileId: tweet.imagekit_fileId,
        UserId: tweet.UserId,
        createdAt: tweet.createdAt,
        User: user,
      };
      context.pubsub.publish("newTweet", { newTweet: responseBody });

      return responseBody;
    } catch (error) {
      return error;
    }
  },

  updateTweet: async (
    root,
    { id, content, imgUrl, imagekit_fileId },
    context
  ) => {
    authenticateUser(context);
    try {
      const tweet = await models.Tweet.findOne({ where: { id: id } });
      if (tweet) {
        //delete the old image from imagekit
        if (tweet.imagekit_fileId) {
          imagekit.deleteFile(tweet.imagekit_fileId, function (error, result) {
            if (error) console.log(error);
            else console.log(result);
          });
        }
        const updatedTweet = await models.Tweet.update(
          {
            content: content,
            imgUrl,
            imagekit_fileId,
          },
          { where: { id: id } }
        );
        return updatedTweet;
      }
      return new Error("Tweet not found");
    } catch (error) {
      return error.message;
    }
  },
  deleteTweet: async (root, { id }, context) => {
    const userData = authenticateUser(context);

    try {
      const tweet = await models.Tweet.findOne({ where: { id: id } });
      if (tweet.UserId !== userData.userId) {
        return new Error("You are not authorized to delete this post");
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
      // const chat = await models.Chat.create({
      //   friendshipId: friendshipId,
      //   senderId: userData.userId,
      //   senderName: userData.userName,
      //   receiverId: receiverId,
      //   receiverName: receiverName,
      //   message: message,
      // });
      const chat = new Chats({
        friendshipId: friendshipId,
        senderId: userData.userId,
        senderName: userData.userName,
        receiverId: receiverId,
        receiverName: receiverName,
        message: message,
      });

      await chat.save();
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

  deleteUser: async (root, { id }, context) => {
    authenticateUser(context);
    try {
      const user = await models.User.findOne({ where: { id } });
      if (!user) {
        return new Error("User not found");
      }
      const destroy = await models.User.destroy({
        where: { id },
      });
      if (destroy) {
        return "User deleted";
      }
      return new Error("User could not be deleted. Please retry");
    } catch (e) {
      console.log("error", error);
      return `We couldn't process your request. Please retry.\n HINT: ${error}`;
    }
  },
};
