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
const { RedisPubSub } = require("graphql-redis-subscriptions");
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

Server.express.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

Server.express.use(cookieParser());

//Rest Endpoints
Server.express.use("/regions", countriesRoutes);
Server.express.use("/activate", utilRoutes);

//Imagekit auth endpoint
Server.get("/imagekitAuth", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  return res.json(result);
});

if (process.env.NODE_ENV === "development") {
  Server.use(morgan("common"));
}
const port = process.env.PORT || 4000;

const options = {
  bodyParserOptions: [
    express.json(),
    express.urlencoded({ extended: true, limit: "50mb" }),
  ],
  // cors: { cors },
  port: port,
  subscriptions: "/subscriptions",
};
models.sequelize.sync({ logging: false });

Server.start(options, async () => {
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
    `Server started in ${process.env.NODE_ENV} mode on port ${options.port}`
  );
  try {
    const pingResponse = client.ping();
    console.log(`Redis server response: ${pingResponse}`);
  } catch (error) {
    console.log(error);
  }
});
