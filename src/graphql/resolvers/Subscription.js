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
      ({ newComment }, variables) => {
        return newComment.TweetId === variables.TweetId;
      }
    ),
  },
  newLike: {
    subscribe: withFilter(
      (_, {}, { pubsub }) => pubsub.asyncIterator("newLike"),
      ({ newLike }, variables) => {
        return newLike.TweetId === variables.TweetId;
      }
    ),
  },

  newChat: {
    subscribe: withFilter(
      (_, {}, { pubsub }) => pubsub.asyncIterator("newChat"),
      ({ newChat }, variables, { user }) => {
        return newChat.friendshipId == variables.friendshipId;
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
