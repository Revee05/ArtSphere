// userModel.js

const { firestore } = require("../config/firestore");

// // Define user schema
// const userSchema = {
//   username: String,
//   email: String,
//   password: String,
//   refreshToken: String,
//   createdAt: Date,
//   updatedAt: Date,
// };

db = process.env.db;

// Create a new user document in Firestore
exports.createUser = async (userData) => {
  try {
    const docRef = await firestore.collection(db).add(userData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

// Get user by email from Firestore
exports.getUserByEmail = async (email) => {
  try {
    const userQuerySnapshot = await firestore
      .collection(db)
      .where("email", "==", email)
      .get();
    if (userQuerySnapshot.empty) {
      return null;
    }
    const userDoc = userQuerySnapshot.docs[0];
    return { userId: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw new Error("Failed to get user by email");
  }
};

// Get user by ID from Firestore
exports.getUserById = async (userId) => {
  try {
    const userDoc = await firestore.collection(db).doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }
    return { userId: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw new Error("Failed to get user by ID");
  }
};

// Update refresh token for a user in Firestore
exports.updateRefreshToken = async (userId, refreshToken) => {
  try {
    const userRef = firestore.collection(db).doc(userId);
    await userRef.update({
      refreshToken,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating refresh token:", error);
    throw new Error("Failed to update refresh token");
  }
};

// Get user by username from Firestore
exports.getUserByUsername = async (username) => {
  try {
    const userQuerySnapshot = await firestore
      .collection(db)
      .where("username", "==", username)
      .get();
    if (userQuerySnapshot.empty) {
      return null;
    }
    const userDoc = userQuerySnapshot.docs[0];
    return { userId: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error("Error getting user by username:", error);
    throw new Error("Failed to get user by username");
  }
};

// Export the user schema
// module.exports = testchema;
