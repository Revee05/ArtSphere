// test/predict.test.js
const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const Hapi = require('@hapi/hapi');
const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');
const routes = require('../routes');
const { preprocessImage } = require('../logger');

const { describe, it, before } = Lab.script();
exports.lab = Lab.script();

describe('POST /predict', () => {
  let server;

  before(async () => {
    server = Hapi.server({
      port: 3000,
      host: 'localhost',
      routes: {
        cors: {
          origin: ["*"],
        },
      },
    });

    const modelPath = path.join(__dirname, '..', 'model', 'model.json');
    const model = await tf.loadLayersModel(`file://${modelPath}`);
    server.app.model = model;
    server.route(routes);
  });

  it('returns 400 if no file is uploaded', async () => {
    const options = {
      method: 'POST',
      url: '/predict'
    };

    const response = await server.inject(options);
    expect(response.statusCode).to.equal(400);
    expect(response.result.message).to.equal('No file uploaded');
  });

  it('returns 200 and the correct label for a valid image', async () => {
    const filePath = path.join(__dirname, 'sample.jpg');
    const fileData = fs.readFileSync(filePath);

    const options = {
      method: 'POST',
      url: '/predict',
      payload: {
        file: fileData
      },
      headers: {
        'content-type': 'multipart/form-data'
      }
    };

    const response = await server.inject(options);
    expect(response.statusCode).to.equal(200);
    expect(response.result).to.have.property('label');
  });
});
