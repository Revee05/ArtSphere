// utils.js
const tf = require('@tensorflow/tfjs-node');

const preprocessImage = (buffer) => {
  try {
    const tensor = tf.node.decodeImage(buffer, 3);
    const resized = tf.image.resizeBilinear(tensor, [224, 224]);
    const normalized = resized.div(255.0);
    return normalized.expandDims(0);
  } catch (error) {
    throw new Error('Error preprocessing image: ' + error.message);
  }
};

module.exports = { preprocessImage };
