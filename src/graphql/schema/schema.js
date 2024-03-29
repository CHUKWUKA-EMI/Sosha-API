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
       imagekit_fileId:String
       birthdate: Date
       headline:String
       bio:String
       country:String
       state:String
       website:String
       sex:String
       username:String
       user_role: String!
       isLoggedIn: Boolean!
     }
     
     type Users{
       id:ID!
       firstName:String!
       lastName:String!
       email: String!
       phone:String!
       createdAt: Date!
       imgUrl:String
       birthdate: Date
       headline:String
       bio:String
       country:String
       state:String
       website:String
       sex:String
       username:String
       isLoggedIn:Boolean!
       user_role: String!
       friendship:Boolean!
       blocked: Boolean!
     }

      type singleUser{
       id:ID!
       firstName:String!
       lastName:String!
       email: String!
       phone:String!
       Tweets:[Tweet!]
       likes:[Like!]
       chats:[Chat!]
       createdAt: Date!
       imgUrl:String
       imagekit_fileId:String
       birthdate: Date
       headline:String
       bio:String
       country:String
       state:String
       website:String
       sex:String
       username:String
       isLoggedIn:Boolean!
       user_role: String!
       friendship:Boolean!
       requeststatus:String!
     }
     scalar Date

     type AuthData{
       	userId: ID!
			  token: String!
			  tokenExpiration: String!
     }
     type Tweet{
         id: ID!
         content: String
         imgUrl:String
         videoUrl:String
         imagekit_fileId:String
         User:User!
         Comments: [Comment!]
         Likes:[Like!]
         createdAt: Date!
         updatedAt: Date!
     }
     type Chat{
       _id: ID
       senderId:ID!
       senderName:String!
       receiverId: ID!
       receiverName:String!
       friendshipId:String!
       message: String!
       createdAt: Date!
     }
     type Comment{
       id: ID!
       User:User!
       comment:String!
       createdAt: Date!
       TweetId:ID!
     }
     type Like{
       id: ID!
       UserId:ID!
       value:Boolean!
       User:User!
       TweetId:ID!
       createdAt: Date!
     }


     type Friend{
       id: ID!
       requesterId:ID!
       friendId:ID!
       friendship:Boolean!
       requeststatus: String!
       blocked: Boolean!
     }

     type UserFriendship{
       friend: Friend
       userId: ID
       firstName:String
       lastName:String
       imgUrl:String
       isLoggedIn:Boolean
       headline:String
       username:String
       lastMessage:String
     }

     type Query{
       user:User!
       retrieveUser(email:String, phone:String, username:String): User!
       tweets:[Tweet!]
       tweet(TweetId:ID!):Tweet!
       comments: [Comment!]
       tweetComments(TweetId:ID!):[Comment]
       likes:[Like!]
       connectedFriends:[UserFriendship]
       chats(friendshipId:ID!):[Chat]
       getUserByName(username:String,token:String):singleUser!
       getAllUsers: [Users]
     }

     type Mutation{
       createUser(firstName:String!,lastName:String!, email: String!,password:String!, phone: String!,country:String!, state:String!,region_code:String!, birthdate:Date):User!
       login(email:String!, password: String!): AuthData!
       logout(userId:ID!):String!
       updateProfile(id:ID!,firstName:String,lastName:String, email: String, phone: String,imgUrl:String,imagekit_fileId:String, birthdate:Date,headline:String,bio:String,country:String,state:String,website:String,sex:String):User!
       resetPassword(password:String!):AuthData!
       createTweet(content: String,imgUrl:String,userId:ID!,imagekit_fileId:String,videoUrl:String):  Tweet!
       updateTweet(id: ID!, content: String,imgUrl:String,imagekit_fileId:String,videoUrl:String): Tweet!
       deleteTweet(id:ID!):String!
       createComment(TweetId:ID!,comment: String):Comment!
       deleteComment(id:ID!):String!
       like(TweetId:ID!):Like!
       unlike(TweetId:ID!):String!
       addToChatConnections(friendId:ID!):Friend!
       blockFriend(userId:ID!):String!
       unblockFriend(userId:ID!):String!
       unFriend(userId:ID!):String!
       createChat(receiverId:ID!,friendshipId:ID!,receiverName:String, message:String!): Chat!
       userTyping(receiverId: ID!): Boolean!
     }

     type Subscription{
       newTweet: Tweet!
       deleteTweet(id:ID!): String!
       newComment(TweetId:ID!): Comment
       newLike(TweetId:ID!): Like!
       newChat(friendshipId:ID!): Chat!
       userTyping(receiverId: ID!):String!
       userLoggedIn:Boolean!
     }
`;

module.exports = typeDefs;
