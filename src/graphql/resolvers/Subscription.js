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
        console.log("subscription", payload, variables);
        return payload.TweetId === variables.TweetId;
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
  newFollow: {
    subscribe: withFilter(
      (_, {}, { pubsub }) => pubsub.asyncIterator("newFollow"),
      (payload, variables) => {
        return payload.targetid === variables.targetid;
      }
    ),
  },
  newChat: {
    subscribe: withFilter(
      (_, {}, { pubsub }) => pubsub.asyncIterator("newChat"),
      (payload, variables) => {
        return payload.receiverId === variables.receiverId;
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
