// main.js
const Hapi = require('@hapi/hapi');
const Boom = require('@hapi/boom');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');
const routes = require('./routes');
const logger = require('./logger');

const modelPath = path.join(__dirname, 'tfjs_model', 'model.json');
let model;

const loadModel = async () => {
  try {
    model = await tf.loadLayersModel(`file://${modelPath}`);
    logger.info('Model loaded successfully');
  } catch (error) {
    logger.error('Error loading the model:', error);
    process.exit(1);
  }
};

const init = async () => {
  await loadModel();

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // Add model to server's app context
  server.app.model = model;

  server.route(routes);

  server.ext('onPreResponse', (request, h) => {
    const response = request.response;
    if (response.isBoom) {
      const error = response.output.payload;
      logger.error('Error response: %o', error);
      return h.response({
        statusCode: error.statusCode,
        error: error.error,
        message: error.message
      }).code(error.statusCode);
    }
    return h.continue;
  });

  await server.start();
  logger.info('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err);
  process.exit(1);
});

init();
