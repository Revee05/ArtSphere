//Server
const Hapi = require("@hapi/hapi");
const JWT = require("hapi-auth-jwt2"); // Import plugin hapi-auth-jwt2
const loadModel = require("./services/loadModel");
//..............
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
  //server.route(predictRoutes);

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Welcome to ArtSphere!";
    },
  });

  // const model = await loadModel();
  // server.app.model = model;

  await server.start();

  console.log(`Server running on ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
