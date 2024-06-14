const tfjs = require("@tensorflow/tfjs-node");

async function loadModel() {
  try {
    return await tfjs.loadLayersModel("process.env.MODEL_URL");
  } catch (error) {
    console.error("Error loading model:", error);
    throw error; // Rethrow the error to handle it appropriately in your application
  }
}

module.exports = loadModel;
