const tf = require("@tensorflow/tfjs-node");

module.exports.predictClassification = async function (model, image) {
  try {
    const tensor = tf.node
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(tf.scalar(255.0))
      .expandDims();

    const prediction = model.predict(tensor);
    const probabilities = await prediction.data();
    const classes = [
      "batik-aceh",
      "batik-asmat",
      "batik-bali",
      "batik-betawi",
      "batik-boraspati",
      "batik-celup",
      "batik-cendrawasih",
      "batik-ceplok",
      "batik-ciamis",
      "batik-dayak",
      "batik-gajah",
      "batik-garutan",
      "batik-geblek-renteng",
      "batik-gentongan",
      "batik-insang",
      "batik-kawung",
      "batik-keraton",
      "batik-lasem",
      "batik-lontara",
      "batik-lumbung",
      "batik-mataketeran",
      "batik-megamendung",
      "batik-minang",
      "batik-pala",
      "batik-parang",
      "batik-pekalongan",
      "batik-poleng",
      "batik-priangan",
      "batik-sekar-jagad",
      "batik-sidoluhur",
      "batik-sidomukti",
      "batik-sogan",
      "batik-tambal",
      "batik-tifa",
    ];

    // Menentukan kelas dengan probabilitas tertinggi
    const predictedClassIndex = probabilities.indexOf(
      Math.max(...probabilities),
    );
    const predictedLabel = classes[predictedClassIndex];

    return { predictedLabel };
  } catch (error) {
    throw Error;
  }
};
