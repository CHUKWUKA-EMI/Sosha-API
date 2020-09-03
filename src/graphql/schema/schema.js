const typeDefs = `
     type User{
       id:ID!
       name:String!
       email: String!
       phone:String!
       Tweets:Tweet!
       createdAt: Date!
       birthdate: Date
     }
     scalar Date

     type AuthData{
       	userId: ID!
			  token: String!
			  tokenExpiration: String!
     }
     type Tweet{
         id: ID!
         content: String!
         User:User!
         Comments: Comment!
         createdAt: Date!
         updatedAt: Date!
     }
     type Chat{
       id: ID!
       user:User!
       username: String!
       receiverId: ID!
       receiverName: String!
       message: String!
       createdAt: Date!
     }
     type Comment{
       id: ID!
       Tweet: Tweet!
       User:User!
       comment:String!
       createdAt: Date!
     }
     type Like{
       id: ID!
       tweet: Tweet!
       user: User!
       createdAt: Date!
     }
     type Follow{
       id: ID!
       user: User!
     }

     type Query{
       user:User!
       retrieveUser(email:String, phone:String, username:String): User
       tweets:Tweet!
       comments: Comment!
       likes:[Like]
       follows:[Follow]
       chats:[Chat]

     }

     type Mutation{
       createUser(name:String!, email: String!,password:String!, phone: String!, birthdate:Date):User!
       login(email:String!, password: String!): AuthData!
       resetPassword(password:String!):AuthData!
       createTweet(UserId: ID!,content: String!):  Tweet!
       updateTweet(id: ID!, content: String!): Tweet!
       deleteTweet(id:ID!):String!
       createComment(TweetId:ID!,UserId:ID!,comment: String):Comment!
       deleteComment(id:ID!):String!
       like(TweetId:ID!, UserId: ID!):Like!
       follow(UserId: ID!): Follow!
       createChat(UserId: ID!, username:String!, receiverId:ID!, message:String!,createdAt:Date!): Chat!
       userTyping(UserId:ID!, receiverId: ID!): Boolean!
     }

     type Subscription{
       newTweet: Tweet
       newComment: Comment
       newLike: Like
       newFollow: Follow
       newChat(receiverId: ID!): Chat
       userTyping(receiverId: ID!):String!
     }
`;

module.exports = typeDefs;
