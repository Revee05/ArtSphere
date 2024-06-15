// handlers.js
const Boom = require('@hapi/boom');
const tf = require('@tensorflow/tfjs-node');
const { logger } = require('../services/ML_stuff/logger');
const { loadModel } =require('../services/loadModel')

const CLASS_NAMES = [
  'Batik Aceh Pintu Aceh', 'Batik Bali Barong', 'Batik Bali Merak', 
  'Batik DKI Ondel-ondel', 'Batik Jawa Barat Megamendung', 
  'Batik Jawa Timur Pring', 'Batik Kalimantan Dayak', 
  'Batik Lampung Gajah', 'Batik Madura Mataketeran', 
  'Batik Maluku Pala', 'Batik NTB Lumbung', 'Batik Papua Asmat', 
  'Batik Papua Cendrawasih', 'Batik Papua Tifa', 'Batik Solo Parang', 
  'Batik Sulawesi Selatan Lontara', 'Batik Sumatera Barat Rumah Minang', 
  'Batik Sumatera Utara Boraspati', 'Batik Yogyakarta Kawung', 
  'Batik Yogyakarta Parang'
];

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

let model;

// Load model saat aplikasi dimulai
(async () => {
  try {
    model = await loadModel();
  } catch (error) {
    console.error('Error loading model:', error);
    process.exit(1); // Keluar dari proses Node.js jika gagal memuat model
  }
})();


const predictHandler = async (request, h) => {
  try {
    const { file } = request.payload;
    if (!file) {
      throw Boom.badRequest('No file uploaded');
    }

    const imageBuffer = await file._data;
    const imageTensor = preprocessImage(imageBuffer);
    const prediction = await model.predict(imageTensor).data();
    const predictedClass = tf.argMax(prediction).dataSync()[0];
    const className = CLASS_NAMES[predictedClass];
    logger.info('Prediction made: %s', className);
    return h.response({ label: className });
  } catch (error) {
    logger.error('Error processing the request:', error);
    return Boom.internal('An error occurred while processing the image');
  }
};

module.exports = {
  predictHandler
};
