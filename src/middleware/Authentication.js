const jwt = require("jsonwebtoken");
require("dotenv").config();

const { JWT_SECRET } = process.env;

const authenticateUser = (context) => {
  const Authorization = context.request.get("Authorization");
  if (!Authorization) {
    throw new Error("Not authenticated");
  }
  const token = Authorization.replace("Bearer ", "");
  if (!token) {
    throw new Error("Token not found");
  }
  const { userId } = jwt.verify(token, JWT_SECRET);
  if (!userId) {
    throw new Error("userId not found in token");
  }

  return userId;
};
module.exports = {
  authenticateUser,
};
