const typeDefs = `
     type User{
       id:ID!
       firstName:String!
       lastName:String!
       email: String!
       phone:String!
       Tweets:[Tweet!]
       comments:[Comment!]
       likes:[Like!]
       chats:[Chat!]
       createdAt: Date!
       imgUrl:String
       birthdate: Date
       headline:String
       bio:String
       country:String
       state:String
       website:String
       sex:String
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
         imgUrl:String!
         User:User!
         Comments: [Comment!]
         Likes:[Like!]
         createdAt: Date!
         updatedAt: Date!
     }
     type Chat{
       id: ID!
       UserId:ID!
       receiverId: ID!
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
       UserId:ID!
       value:Boolean!
       createdAt: Date!
     }
     type Follow{
       id: ID!
       targetid:ID!
       value:Boolean!
       user: User!
     }

     type Query{
       user:User!
       retrieveUser(email:String, phone:String, username:String): User!
       tweets:[Tweet!]
       comments: [Comment!]
       likes:[Like!]
       follows:[Follow!]
       chats:[Chat!]

     }

     type Mutation{
       createUser(firstName:String!,lastName:String!, email: String!,password:String!, phone: String!, birthdate:Date):User!
       login(email:String!, password: String!): AuthData!
       updateProfile(firstName:String,lastName:String, email: String, phone: String,imgUrl:String, birthdate:Date,headline:String,bio:String,country:String,state:String,website:String,sex:String):User!
       resetPassword(password:String!):AuthData!
       createTweet(content: String!,imgUrl:String):  Tweet!
       updateTweet(id: ID!, content: String,imgUrl:String): Tweet!
       deleteTweet(id:ID!):String!
       createComment(TweetId:ID!,comment: String):Comment!
       deleteComment(id:ID!):String!
       like(TweetId:ID!):Like!
       follow(targetid:ID!): Follow!
       createChat(username:String, receiverId:ID!, message:String!): Chat!
       userTyping(receiverId: ID!): Boolean!
     }

     type Subscription{
       newTweet: Tweet!
       newComment(TweetId:ID!): Comment!
       newLike(TweetId:ID!): Like!
       newFollow(targetid:ID!): Follow!
       newChat(receiverId: ID!): Chat!
       userTyping(receiverId: ID!):String!
     }
`;

module.exports = typeDefs;
