const { GraphQLServer, PubSub } = require("graphql-yoga");
const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const sequelize = require("./DB/connection");
const models = require("./DB/database");
const typeDefs = require("./graphql/schema/schema");
const rootResolver = require("./graphql/resolvers/index");

dotenv.config();
const pubsub = new PubSub();

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

Server.get("/activate/:token", async (req, res, next) => {
  const { token } = req.params;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    if (id) {
      const user = await models.User.findOne({ where: { id } });
      if (user) {
        await user.update({ activated: true });
        return res.redirect(`${FRONTEND_URL}/login`);
      }
      return res.send(`User with ID ${id} not found`);
    }
    return res.send("Invalid token");
  } catch (error) {
    next(error);
  }
});

if (process.env.NODE_ENV === "development") {
  Server.use(morgan("dev"));
}
const port = process.env.PORT || 4000;

const options = {
  bodyParserOptions: [
    bodyparser.json(),
    bodyparser.urlencoded({ extended: false }),
  ],
  cors: { cors },
  port: port,
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
});
