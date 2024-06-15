// predictRoutes.js
const { predictHandler } = require('../controllers/predictController');

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
      },
      handler: predictHandler
    }
  }
];

module.exports = routes;
