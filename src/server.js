const { GraphQLServer } = require("graphql-yoga");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const sequelize = require("./DB/connection");
const models = require("./DB/database");
const typeDefs = require("./graphql/schema/schema");
const rootResolver = require("./graphql/resolvers/index");
const countriesRoutes = require("./restRoutes/countriesRoutes");
const utilRoutes = require("./restRoutes/utilRoutes");
const userRoutes = require("./restRoutes/userRoutes");
const adminRoutes = require("./restRoutes/adminRoutes");
const twitterAPIs = require("./restRoutes/twitterAPIs");
const { startStream } = require("./restRoutes/twitterAPIs");
const { RedisPubSub } = require("graphql-redis-subscriptions");
const { Server: SocketIOServer } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const mongoose = require("mongoose");
const redis = require("redis");
const ImageKit = require("imagekit");

dotenv.config();
// const pubsub = new PubSub();

const redisOptions = {
  url: process.env.REDIS_URL,
  retry_strategy: (times) => {
    // reconnect after
    return Math.min(times * 50, 2000);
  },
};

const client = redis.createClient(redisOptions);
const client2 = redis.createClient(redisOptions);

const pubsub = new RedisPubSub({
  publisher: client,
  subscriber: client2,
});

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

const Server = new GraphQLServer({
  typeDefs: typeDefs,
  resolvers: rootResolver,
  context: (request) => {
    return {
      ...request,
      pubsub,
    };
  },
});

const port = process.env.PORT || 4000;
const options = {
  bodyPars: [
    express.json(),
    express.urlencoded({ extended: true, limit: "50mb" }),
  ],
  // cors: { cors },
  port: port,
  subscriptions: "/subscriptions",
};

Server.express.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

Server.express.use(cookieParser());

// Server.express.post("/stream/rules", (req, res) => {
//   console.log("req body", JSON.parse(JSON.stringify(req.query)));
// });
// Imagekit auth endpoint
Server.get("/imagekitAuth", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  return res.json(result);
});

if (process.env.NODE_ENV === "development") {
  // app.use(morgan("common"));
  Server.use(morgan("common"));
}

let serverInstance;
(async () => {
  serverInstance = await Server.start(options, async () => {
    try {
      await sequelize.authenticate({ logging: false });
      console.log("Database connected");
      try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connected");
      } catch (error) {
        console.log(error);
      }
    } catch (err) {
      console.log(err.message);
      process.exit(1);
    }
    console.log(
      `Server started in ${process.env.NODE_ENV} mode on port ${port}`
    );
    try {
      const pingResponse = client.ping();
      console.log(`Redis server response: ${pingResponse}`);
    } catch (error) {
      console.log(error);
    }
  });
})();

const socketPort = process.env.SOCKET_PORT || 4001;

const io = new SocketIOServer(socketPort, {
  cors: {
    origin: "*",
    methods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

io.adapter(createAdapter(client, client2));

// stream twitter data in real-time
io.on("connection", async (socket) => {
  console.log("socket connected", socket.id);
  io.emit("connected", { message: socket.id });
  // const stream = await startStream(socket);
  // console.log("stream", stream);
});

//Rest Endpoints
Server.express.use("/regions", countriesRoutes);
Server.express.use("/activate", utilRoutes);
Server.express.use("/user", userRoutes);
Server.express.use("/admin", adminRoutes);
Server.express.use("/stream", twitterAPIs);
