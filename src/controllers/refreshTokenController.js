const jwt = require("jsonwebtoken");
require("dotenv").config();

const userModel = require("../models/userModel");

exports.refreshToken = async (request, h) => {
  try {
    // Get refresh token from cookies
    const refreshToken = request.state.refreshToken;

    if (!refreshToken) {
      return h
        .response({ error: "Hey! long time no see!.... Please login again!" })
        .code(401);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const userId = decoded.userId;
    const userData = await userModel.getUserById(userId);

    if (!userData || userData.refreshToken !== refreshToken) {
      return h.response({ error: "Invalid refresh token" }).code(403);
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: userData.userId,
        username: userData.username,
        email: userData.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2h" },
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      {
        userId: userData.userId,
        username: userData.username,
        email: userData.email,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "3d" },
    );

    // Update refresh token in database
    await userModel.updateRefreshToken(userData.userId, newRefreshToken);

    // Save new refresh token to client cookie
    h.state("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 2 * 86400000, // 2 days in milliseconds
      secure: true
    });

    return h.response({ accessToken: newAccessToken }).code(200);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return h.response({ error: "Invalid refresh token" }).code(403);
    }
    console.error("Error refreshing token:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};
