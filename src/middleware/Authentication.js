const jwt = require("jsonwebtoken");
require("dotenv").config();

const { JWT_SECRET } = process.env;

const freePath = (context) => {
  if (
    context.request.path.startsWith("/activate") ||
    context.request.path.startsWith("/imagekitAuth") ||
    context.request.path.startsWith("/regions") ||
    context.request.path === "/user/password_reset" ||
    context.request.path.startsWith("/stream")
  ) {
    return true;
  } else {
    return false;
  }
};
const authenticateUser = (context) => {
  let token = context.request
    ? context.request.get("Authorization") ||
      context.request.body.variables.token
    : context.connection.context.Authorization;

  if (token === undefined && context.connection) {
    token = context.connection.context.Authorization;
  } else if (token === undefined && context.request.cookies) {
    token = context.request.cookies.token;
  }

  if (!freePath(context) && !token) {
    return new Error("Token not found");
  }

  const userData = jwt.verify(token, JWT_SECRET);
  if (!userData.userId) {
    return new Error("userId not found in token");
  }
  context.request.user = userData;
  return userData;
};
module.exports = {
  authenticateUser,
};
