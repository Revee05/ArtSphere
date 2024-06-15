// verifyToken.js

const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (request, h) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return h.response({ error: "No token provided" }).code(401).takeover();
    }

    const token = authHeader.split(" ")[1]; // Assuming 'Bearer <token>'
    if (!token) {
      return h.response({ error: "No token provided" }).code(401).takeover();
    }

    // Verify token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return h
          .response({ error: "Failed to authenticate token" })
          .code(403)
          .takeover();
      }
      // Attach decoded token to request
      request.auth = {
        credentials: decoded,
      };
    });

    return h.continue;
  } catch (error) {
    console.error("Error verifying token:", error);
    return h.response({ error: "Internal Server Error" }).code(500).takeover();
  }
};

module.exports = verifyToken;
