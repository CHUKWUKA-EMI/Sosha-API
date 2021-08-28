const { withFilter } = require("graphql-yoga");
module.exports = {
  newTweet: {
    subscribe: (_, {}, { pubsub }) => {
      return pubsub.asyncIterator("newTweet");
    },
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
  newFriendRequest: {
    subscribe: withFilter(
      (_, {}, { pubsub }) => pubsub.asyncIterator("newFriendRequest"),
      (payload, variables) => {
        return payload.friendId === variables.friendId;
      }
    ),
  },

  acceptFriendRequest: {
    subscribe: withFilter(
      (_, {}, { pubsub }) => pubsub.asyncIterator("acceptFriendRequest"),
      (payload, variables) => {
        return payload.requesterId === variables.requesterId;
      }
    ),
  },

  newChat: {
    subscribe: withFilter(
      (_, {}, { pubsub }) => pubsub.asyncIterator("newChat"),
      (payload, variables) => {
        return payload.friendshipId === variables.friendshipId;
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
