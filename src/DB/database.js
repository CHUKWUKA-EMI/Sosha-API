const Sequelize = require("sequelize");
const sequelize = require("./connection");

const User = require("../models/user");
const Tweet = require("../models/tweet");
const Comment = require("../models/comment");
const Like = require("../models/like");
const Friend = require("../models/friend");
const Chat = require("../models/chat");
const Acivate = require("../models/activationTokens");
const ResetPassword = require("../models/password-reset");

//User relations
User.hasMany(Tweet, {
  foreignKey: "UserId",
  onDelete: "CASCADE",
});

User.hasMany(Comment, {
  foreignKey: "UserId",
  onDelete: "CASCADE",
});

User.hasMany(Like, {
  foreignKey: "UserId",
  onDelete: "CASCADE",
});

User.hasMany(Friend, {
  foreignKey: "requesterId",
  onDelete: "CASCADE",
});

// User.hasMany(Chat, {
//   foreignKey: "UserId",
//   onDelete: "CASCADE",
// });

//Tweet relations
Tweet.belongsTo(User, {
  foreignKey: "UserId",
  onDelete: "CASCADE",
});
Tweet.hasMany(Comment, {
  foreignKey: "TweetId",
  onDelete: "CASCADE",
});
Tweet.hasMany(Like, {
  foreignKey: "TweetId",
  onDelete: "CASCADE",
});

//Comment relations
Comment.belongsTo(User, {
  foreignKey: "UserId",
});
Comment.belongsTo(Tweet, {
  foreignKey: "TweetId",
});

//Like relations
Like.belongsTo(User, {
  foreignKey: "UserId",
});

Like.belongsTo(Tweet, {
  foreignKey: "TweetId",
});

//Friend reln
Friend.belongsTo(User, {
  foreignKey: "requesterId",
});

//Chat reln
// Chat.belongsTo(User, {
//   foreignKey: "UserId",
// });

const models = {};

models.sequelize = sequelize;
models.Sequelize = Sequelize;
models.User = User;
models.Tweet = Tweet;
models.Comment = Comment;
models.Like = Like;
models.Friend = Friend;
models.Chat = Chat;
models.Acivate = Acivate;
models.ResetPassword = ResetPassword;

module.exports = models;
