//Server
const Hapi = require("@hapi/hapi");
const Boom = require('@hapi/boom');

//package
const { logger } = require('../src/services/ML_stuff/logger');

//..............env
require("dotenv").config();

//Var Routes
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const predictRoutes = require("./routes/predictRoutes");

const init = async () => {

  const server = Hapi.server({
    port: process.env.PORT || 8080,
    host: process.env.HOST || "localhost",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  //all routes
  server.route(authRoutes);
  server.route(homeRoutes);
  server.route(predictRoutes);


  //default routes
  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Welcome to ArtSphere!";
    },
  });

  //handling error
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

  console.log(`Server running on ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
