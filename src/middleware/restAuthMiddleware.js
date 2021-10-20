const jwt = require("jsonwebtoken");
require("dotenv").config();

const { JWT_SECRET } = process.env;

const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      message: "Authorization headers not set",
    });
  }
  try {
    const decoded = jwt.decode(token, JWT_SECRET);
    const now = new Date(Date.now()).toISOString();
    const expiryDate = new Date(decoded.exp * 1000).toISOString();
    if (expiryDate < now) {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    const userData = jwt.verify(token, JWT_SECRET);
    req.user = userData;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Auth failed",
    });
  }
};

module.exports = authenticate;
