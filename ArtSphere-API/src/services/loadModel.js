// modelLoader.js
const tf = require('@tensorflow/tfjs-node');
const path = require('path');

const modelPath = path.join(__dirname, './ML_stuff/ML_RSS/model.json'); // Sesuaikan path sesuai struktur folder Anda

const loadModel = async () => {
  try {
    const model = await tf.loadLayersModel('file://' + modelPath);
    console.log('Model loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading model from local file system:', error);
    throw error;
  }
};

module.exports = {
  loadModel
};
