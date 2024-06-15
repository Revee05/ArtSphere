// userController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userModel = require("../models/userModel");

// Register user
exports.register = async (request, h) => {
  try {
    const { username, email, password } = request.payload;

    // Check if user with the same email or username already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return h
        .response({
          error: "username and email error.",
        })
        .code(400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username,
      email,
      password: hashedPassword,
      refreshToken: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userId = await userModel.createUser(newUser);
    return h
      .response({ message: "User registered successfully", userId })
      .code(201);
  } catch (error) {
    console.error("Error registering user:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};

exports.login = async (request, h) => {
  try {
    const { emailOrUsername, password } = request.payload;

    // Validasi bahwa emailOrUsername tidak kosong
    if (!emailOrUsername || typeof emailOrUsername !== 'string') {
      return h.response({ error: "Invalid email or username" }).code(400);
    }

    let userData;

    // Check if input is email or username
    if (emailOrUsername.includes('@')) {
      // Input is email
      userData = await userModel.getUserByEmail(emailOrUsername);
    } else {
      // Input is username
      userData = await userModel.getUserByUsername(emailOrUsername);
    }

    if (!userData) {
      return h.response({ error: "Invalid email or username or password" }).code(400);
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return h.response({ error: "Invalid email or username or password" }).code(400);
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: userData.userId,
        username: userData.username,
        email: userData.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2h" },
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: userData.userId,
        username: userData.username,
        email: userData.email,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "3d" },
    );

    // Update refresh token in database
    await userModel.updateRefreshToken(userData.userId, refreshToken);

    // Save refresh token to client cookie
    h.state("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 2 * 86400000, // 2 days in milliseconds
      secure: true, //only in https
      sameSite: 'Strict' // enforce strict same-site policy
    });

    // Return response with user details and access token
    return h.response({
      message: "User logged in successfully",
      id: userData.userId,
      username: userData.username,
      email: userData.email,
      accessToken
    }).code(200);

  } catch (error) {
    console.error("Error logging in user:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};

// Get user details
exports.getUser = async (request, h) => {
  try {
    // Retrieve user data based on logged in user
    const userId = request.auth.credentials.userId;
    const userData = await userModel.getUserById(userId);
    if (!userData) {
      return h.response({ error: "User not found" }).code(404);
    }
    // Return user data
    const userDetails = {
      username: userData.username,
      email: userData.email,
    };
    return h
      .response({
        message: "User details retrieved successfully",
        user: userDetails,
      })
      .code(200);
  } catch (error) {
    console.error("Error getting user details:", error);
    return h.response({ error: "forbidden!!" }).code(500);
  }
};

// Logout user
exports.logOut = async (request, h) => {
  try {
    // Delete refresh token from database
    const userId = request.auth.credentials.userId;
    await userModel.updateRefreshToken(userId, "");

    // Clear refresh token from client cookie
    h.unstate("refreshToken");

    return h.response({ message: "User logged out successfully" }).code(200);
  } catch (error) {
    console.error("Error logging out user:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};
