// routes.js
const multer = require('multer');
const Boom = require('@hapi/boom');
const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const { preprocessImage } = require('./utils');
const logger = require('./logger');

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

const upload = multer({ dest: path.join(__dirname, 'uploads/') });

const routes = [
  {
    method: 'POST',
    path: '/predict',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
        multipart: true
      }
    },
    handler: async (request, h) => {
      try {
        const { file } = request.payload;
        if (!file) {
          throw Boom.badRequest('No file uploaded');
        }

        const imageBuffer = await file._data;
        const imageTensor = preprocessImage(imageBuffer);
        const prediction = await request.server.app.model.predict(imageTensor).data();
        const predictedClass = tf.argMax(prediction).dataSync()[0];
        const className = CLASS_NAMES[predictedClass];
        logger.info('Prediction made: %s', className);
        return h.response({ label: className });
      } catch (error) {
        logger.error('Error processing the request:', error);
        return Boom.internal('An error occurred while processing the image');
      }
    }
  }
];

module.exports = routes;
