const { withFilter } = require("graphql-yoga");
module.exports = {
  newTweet: {
    subscribe: (_, {}, { pubsub }) => {
      return pubsub.asyncIterator("newTweet");
    },
  },
  deleteTweet: {
    subscribe: withFilter(
      (_, {}, { pubsub }) => pubsub.asyncIterator("deleteTweet"),
      (payload, variables) => {
        return payload.deleteTweet === variables.id;
      }
    ),
  },
  newComment: {
    subscribe: withFilter(
      (_, {}, { pubsub }) => pubsub.asyncIterator("newComment"),
      (payload, variables) => {
        return payload.newComment.TweetId === variables.TweetId;
      }
    ),
  },
  newLike: {
    subscribe: withFilter(
      (_, {}, { pubsub }) => pubsub.asyncIterator("newLike"),
      (payload, variables) => {
        return payload.TweetId === variables.TweetId;
      }
    ),
  },

  newChat: {
    subscribe: withFilter(
      (_, {}, { pubsub }) => pubsub.asyncIterator("newChat"),
      ({ newChat }, variables, { user }) => {
        console.log("user", user);
        return (
          (newChat.senderId == user.userId &&
            newChat.receiverId == variables.receiverId) ||
          (newChat.senderId == variables.receiverId &&
            newChat.receiverId == user.userId)
        );
      }
    ),
  },
  userTyping: {
    subscribe: withFilter(
      (_, {}, { pubsub }) => pubsub.asyncIterator("userTyping"),
      (payload, variables) => {
        return payload.receiverId === variables.receiverId;
      }
    ),
  },
};
