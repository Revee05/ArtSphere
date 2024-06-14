// authRoutes.js

const userController = require("../controllers/userController");
const refreshTokenController = require("../controllers/refreshTokenController");
const verifyToken = require("../middleware/verifyToken");

module.exports = [
  // User routes
  {
    method: "POST",
    path: "/register",
    handler: userController.register,
  },
  {
    method: "POST",
    path: "/login",
    handler: userController.login,
  },
  {
    method: "GET",
    path: "/user",
    handler: userController.getUser,
    options: {
      pre: [verifyToken], // Apply verifyToken middleware to this route
    },
  },
  {
    method: "DELETE",
    path: "/logout",
    handler: userController.logOut,
    options: {
      pre: [verifyToken], // Apply verifyToken middleware to this route
    },
  },
  // Refresh token route (login tapna relog)
  {
    method: "GET",
    path: "/refresh-token",
    handler: refreshTokenController.refreshToken,
    options: {
      auth: false, // Pastikan route ini tidak memerlukan autentikasi karena ini digunakan untuk merefresh token
      state: {
        parse: true,
        failAction: "log",
      },
    },
  },
];
