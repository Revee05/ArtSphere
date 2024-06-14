const { Storage } = require("@google-cloud/storage");

// Inisialisasi Google Cloud Storage dengan menggunakan kredensial autentikasi
const storage = new Storage({
  //keyFilename: "../src/keys/storage", // Ganti dengan path ke kredensial autentikasi Anda
});

module.exports = { 
  storage
};
