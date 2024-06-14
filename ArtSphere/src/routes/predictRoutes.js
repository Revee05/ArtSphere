const predictController = require("../controllers/predictController");

module.exports = [
  {
    method: "POST",
    path: "/predict",
    handler: predictController.predictBatik,
    options: {
      payload: {
        maxBytes: 100 * 1024 * 1024, // Set payload limit to 100MB
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: true,
        // pre: .....
        multipart: {
          output: "stream",
        },
      },
    },
  },
];
