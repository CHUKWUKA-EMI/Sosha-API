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
const { RedisPubSub } = require("graphql-redis-subscriptions");
const Redis = require("ioredis");

dotenv.config();
// const pubsub = new PubSub();
const redisOptions = {
  port: process.env.PORT_NUMBER,
  host: process.env.REDIS_DOMAIN_NAME,
  password: process.env.REDIS_AUTH,
  retryStrategy: (times) => {
    // reconnect after
    return Math.min(times * 50, 2000);
  },
};

const client = new Redis(redisOptions);
const client2 = new Redis(redisOptions);

const pubsub = new RedisPubSub({
  publisher: client,
  subscriber: client2,
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

Server.get("/activate/:token", async (req, res, next) => {
  const { token } = req.params;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    if (id) {
      const user = await models.User.findOne({ where: { id } });
      if (user) {
        await user.update({ activated: true });
        return res.redirect(`${process.env.FRONTEND_URL}/login`);
      }
      return res.send(`User with ID ${id} not found`);
    }
    return res.send("Invalid token");
  } catch (error) {
    next(error);
  }
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
  } catch (err) {
    console.log(err.message);
  }
  console.log(
    `Server started in ${process.env.NODE_ENV} mode on port ${options.port}`
  );
  const pingResponse = await client.ping();
  console.log(`Redis server response: ${pingResponse}`);
});
