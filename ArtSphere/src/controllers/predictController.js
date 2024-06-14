const tf = require("@tensorflow/tfjs-node");
const sharp = require("sharp");
const firestore = require("../config/firestore");
const storage = require("../config/gcs");
const { model } = require("../services/loadModel");
require("dotenv").config();

const classLabels = [
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

const predictBatik = async (request, h) => {
  try {
    // Pastikan untuk mengakses file dengan benar dari payload
    const image = request.payload.file;

    // Periksa apakah file gambar telah diunggah
    if (!image) {
      return h.response({ error: "No image uploaded" }).code(400);
    }

    // Ambil buffer dari file gambar
    //const imageBuffer = image._data;
    const timestamp = new Date().toISOString();
    // Preproses gambar
    const processedImage = await sharp(image)
      .resize(150, 150)
      .toFormat("png")
      .toBuffer();

    const imageTensor = tf.node
      .decodeImage(processedImage, 3)
      .expandDims(0)
      .div(tf.scalar(255.0));

    // Melakukan prediksi
    if (!model) {
      return h.response({ error: "Model not loaded" }).code(500);
    }

    const predictions = await model.predict(imageTensor).data();
    const predictedClassIndex = predictions.indexOf(Math.max(...predictions));
    const predictedLabel = classLabels[predictedClassIndex];

    // Menentukan informasi tambahan berdasarkan label yang diprediksi
    let origin, description;

    if (predictedLabel === "batik-aceh") {
      origin = "Aceh, Indonesia";
      description =
        " The philosophy behind Aceh batik reflects the rich cultural heritage and history of Aceh, influenced strongly by Islam. The motifs often depict religious symbols, nature, and daily life";
    } else if (predictedLabel === "batik-asmat") {
      origin = "Asmat region, Papua Province, Indonesia";
      description =
        "Batik from the Asmat region embodies the cultural richness and traditions of the Asmat people, known for their intricate woodcarvings and connection to the natural world. The motifs often represent ancestral spirits, animals, and elements of the rainforest, reflecting the deep spiritual beliefs and connection to their environment";
    } else if (predictedLabel === "batik-bali") {
      origin = "Bali, Indonesia";
      description =
        "Batik from Bali reflects the vibrant and colorful culture of the island, known for its intricate designs and use of vibrant colors. The motifs often draw inspiration from Balinese Hindu mythology, nature, and traditional ceremonies, showcasing the islands rich spiritual and artistic heritage";
    } else if (predictedLabel === "batik-betawi") {
      origin = "Jakarta, Indonesia";
      description =
        "Batik Betawi originates from the Betawi ethnic group in Jakarta, Indonesias capital city. It represents a fusion of Javanese, Chinese, Arab, and Malay influences, reflecting Jakartas diverse cultural heritage. The motifs often feature floral patterns, geometric designs, and scenes from urban life, capturing the dynamic essence of Betawi culture";
    } else if (predictedLabel === "batik-boraspati") {
      origin = "Cirebon, West Java, Indonesia";
      description =
        'Batik Boraspati is distinguished by its intricate motifs, often featuring intricate floral patterns, mythical creatures, and geometric designs. The name "Boraspati" is derived from Sanskrit, symbolizing prosperity and abundance. This style of batik reflects the rich cultural heritage of Cirebon and is often used for special occasions and ceremonies';
    } else if (predictedLabel === "batik-celup") {
      origin = "Java, Indonesia";
      description =
        "Batik celup is a traditional batik technique originating from various regions in Indonesia. Batik celup, or tie-dye batik, involves dipping the cloth into dye baths multiple times to achieve vibrant and intricate patterns. This technique allows for a wide range of designs, from simple geometric shapes to complex motifs inspired by nature and culture. Batik celup is known for its distinctive blurred edges and gradient effects, creating unique and visually stunning textiles";
    } else if (predictedLabel === "batik-cendrawasih") {
      origin = "Papua Province, Indonesia";
      description =
        "Batik Cendrawasih is characterized by its intricate motifs inspired by the cendrawasih bird, also known as the bird of paradise, which is native to Papua. The motifs often depict the birds vibrant plumage and graceful movements, along with other elements of Papuan flora and fauna. This style of batik reflects the cultural richness and biodiversity of Papua, showcasing the regions unique natural heritage";
    } else if (predictedLabel === "batik-ceplok") {
      origin = "Central Java, Indonesia";
      description =
        ' Batik Ceplok is characterized by its geometric motifs, often arranged in a repetitive pattern resembling a grid or lattice. The word "ceplok" itself means "to put in a box" in Javanese, reflecting the structured arrangement of the motifs. These geometric designs can vary widely, ranging from simple squares and diamonds to more intricate patterns inspired by nature or cultural symbols. Batik Ceplok is a classic style of batik that remains popular in Central Java and beyond, reflecting the timeless beauty of Javanese batik artistry.';
    } else if (predictedLabel === "batik-ciamis") {
      origin = "Ciamis Regency, West Java, Indonesia";
      description =
        " Batik Ciamis is known for its unique motifs, which often incorporate geometric patterns, floral designs, and elements inspired by nature. The colors used in Batik Ciamis are typically vibrant and bold, reflecting the rich cultural heritage of the region. This style of batik often features intricate detailing and fine craftsmanship, making it highly prized among collectors and enthusiasts. Batik Ciamis serves as an important cultural symbol of the artistic traditions and heritage of West Java.";
    } else if (predictedLabel === "batik-dayak") {
      origin = "Kalimatnan, Indonesia";
      description =
        "Batik Kalimantan/Dayak is a typical Batik clothing originating from the island of Kalimantan which also has batik produced using the wax resist technique. However, Kalimantan batik is often confused with tritik jum putan or sasirangan cloth, even though technically and the motifs produced are different.";
    } else if (predictedLabel === "batik-gajah") {
      origin =
        "Batik Gajah, or Elephant Batik, is a traditional batik style originating from Lampung, a province located on the southern tip of Sumatra, Indonesia.";
      description =
        "Batik Gajah is characterized by its motifs featuring elephants, a symbol of strength, power, and wisdom in Indonesian culture. These motifs often depict elephants in various poses, surrounded by intricate patterns and designs inspired by nature and traditional Lampung motifs. Batik Gajah reflects the rich cultural heritage of Lampung and its close ties to nature and wildlife. This style of batik is cherished for its symbolic significance and artistic beauty, making it a prized textile among collectors and enthusiasts.";
    } else if (predictedLabel === "batik-garutan") {
      origin =
        "Batik Garutan is a traditional batik style originating from Garut, a regency in West Java, Indonesia.";
      description =
        "Batik Garutan is distinguished by its intricate motifs, often featuring floral patterns, geometric designs, and traditional Garut motifs. The colors used in Batik Garutan are typically earthy tones, reflecting the natural beauty of the region. This style of batik is known for its fine craftsmanship and attention to detail, with motifs meticulously hand-drawn or stamped onto the fabric using wax-resist techniques. Batik Garutan holds a special place in Javanese culture, representing the artistic traditions and heritage of Garut and its surrounding areas.";
    } else if (predictedLabel === "batik-geblek-renteng") {
      origin =
        "Batik Geblek Renteng is a traditional batik style originating from Bantul Regency, Yogyakarta, Indonesia.";
      description =
        ' Batik Geblek Renteng is characterized by its bold and dynamic motifs, often featuring abstract geometric patterns and repetitive designs. The term "geblek" refers to the distinctive sound made by wooden blocks used in the batik-making process, while "renteng" refers to the rhythmic arrangement of motifs. This style of batik is known for its vibrant colors and expressive patterns, reflecting the creative spirit and cultural heritage of Bantul. Batik Geblek Renteng is highly valued for its artistic uniqueness and serves as a symbol of local identity and pride.';
    } else if (predictedLabel === "batik-gentongan") {
      origin =
        "Batik Gentongan is a traditional batik style originating from Pekalongan, a regency in Central Java, Indonesia.";
      description =
        'Batik Gentongan is distinguished by its motifs inspired by local cultural elements and natural surroundings. The name "Gentongan" is derived from the traditional containers used to store batik dye, reflecting the close connection between this style of batik and the local batik-making process. Batik Gentongan often features intricate floral patterns, geometric designs, and motifs inspired by Pekalongans maritime heritage. This style of batik is celebrated for its vibrant colors, fine craftsmanship, and rich cultural symbolism, making it a cherished textile among collectors and enthusiasts.';
    } else if (predictedLabel === "batik-insang") {
      origin =
        "InsangBatik Insang is a traditional batik style originating from Palembang, South Sumatra, Indonesia.";
      description =
        'Batik Insang is characterized by its motifs inspired by the "insang," which translates to "gill" in English, referring to the intricate fish gill patterns found in this style of batik. The motifs often feature geometric designs resembling fish scales, as well as motifs inspired by aquatic life and river landscapes. Batik Insang reflects the cultural heritage of Palembang, a region known for its rivers and maritime traditions. This style of batik is valued for its artistic intricacy, fine craftsmanship, and connection to the local environment, making it a symbol of pride and identity for the people of Palembang.';
    } else if (predictedLabel === "batik-kawung") {
      origin =
        "Batik Kawung is a traditional batik motif originating from Java, Indonesia.";
      description =
        "Batik Kawung is characterized by its repeated geometric pattern, consisting of intersecting circles or rosettes. These motifs are arranged in a grid-like formation, creating a symmetrical and balanced design. The motif is believed to have ancient Javanese origins, possibly representing the intersection of four mango blossoms, symbolizing universal harmony and balance. Batik Kawung is typically done in darker colors, such as brown, black, or deep blue, on a lighter background, resulting in a striking contrast. This classic motif has been widely used in Javanese batik for centuries and remains popular in contemporary batik designs.";
    } else if (predictedLabel === "batik-keraton") {
      origin =
        "Batik Keraton, or Palace Batik, originates from the royal courts of Java, Indonesia.";
      description =
        "Batik Keraton is characterized by its elaborate and intricate motifs, often depicting scenes from Javanese mythology, royal symbols, and intricate floral patterns. This style of batik was historically reserved for members of the royal family and courtiers, reflecting their status and wealth. Batik Keraton is known for its luxurious appearance, fine craftsmanship, and use of high-quality materials. The motifs in Batik Keraton often hold deep symbolic meaning, reflecting the cultural and spiritual heritage of Java. Today, Batik Keraton continues to be highly prized for its elegance and historical significance, serving as a symbol of Javanese cultural identity and tradition.";
    } else if (predictedLabel === "batik-lasem") {
      origin =
        "Batik Lasem is a traditional batik style originating from Lasem, a town located in Central Java, Indonesia.";
      description =
        'Batik Lasem is characterized by its intricate motifs, which often feature a combination of Chinese and Javanese cultural influences. The motifs typically include floral patterns, mythical creatures, and intricate geometric designs. What distinguishes Batik Lasem is the use of "Lancip," a technique where the motifs are outlined with fine lines, creating a sharp and detailed appearance. Additionally, Batik Lasem often incorporates indigo blue and white colors, reflecting its Chinese influence. This style of batik is highly valued for its fine craftsmanship and unique blend of cultural elements, making it a symbol of Lasems rich cultural heritage.';
    } else if (predictedLabel === "batik-lontara") {
      origin =
        "Batik Lontara is a traditional batik style originating from Sulawesi, Indonesia, particularly among the Bugis and Makassar ethnic groups.";
      description =
        "Batik Lontara is characterized by its motifs inspired by the Lontara script, an ancient Bugis-Makassar script traditionally used for writing manuscripts on palm leaves. The motifs often feature intricate geometric patterns resembling the curves and lines of the Lontara script, as well as motifs inspired by local flora, fauna, and cultural symbols. Batik Lontara reflects the rich cultural heritage and artistic traditions of the Bugis and Makassar people, serving as a visual representation of their identity and history. This style of batik is highly valued for its artistic complexity, fine craftsmanship, and cultural significance, making it a cherished textile among the Bugis and Makassar communities.";
    } else if (predictedLabel === "batik-lumbung") {
      origin =
        "Batik Lumbung is a traditional batik style originating from Banyumas, a regency in Central Java, Indonesia.";
      description =
        'Batik Lumbung is characterized by its motifs inspired by agricultural elements, particularly the "lumbung" or traditional Javanese rice barn. The motifs often feature geometric patterns resembling the roof and walls of the rice barn, as well as motifs inspired by rice paddies, plants, and agricultural tools. Batik Lumbung reflects the agricultural heritage of Banyumas and its importance as a rice-producing region. This style of batik is valued for its rustic charm, intricate detailing, and connection to local traditions, making it a symbol of pride and identity for the people of Banyumas.';
    } else if (predictedLabel === "batik-mataketeran") {
      origin =
        "Batik Matakeran is a traditional batik style originating from Riau Province, Indonesia.";
      description =
        'Batik Matakeran is characterized by its motifs inspired by the patterns found in traditional woven mats, known as "keranjang" or "tambok." The motifs often feature geometric designs resembling the intricate weaving patterns of these mats, as well as motifs inspired by local flora, fauna, and cultural symbols. Batik Matakeran reflects the rich cultural heritage and artistic traditions of the Riau region. This style of batik is highly valued for its intricate detailing, fine craftsmanship, and cultural significance, making it a cherished textile among the people of Riau.';
    } else if (predictedLabel === "batik-megamendung") {
      origin =
        "Batik Megamendung is a traditional batik motif originating from Cirebon, West Java, Indonesia.";
      description =
        'Batik Megamendung, which translates to "clouds with rain" in English, is characterized by its unique motif resembling stylized clouds with raindrops falling from them. The motif is arranged in rows or columns, creating a visually striking pattern across the fabric. Batik Megamendung traditionally uses indigo blue and white colors, although modern interpretations may incorporate additional hues. This style of batik is associated with prosperity and fertility, and it is often worn during special occasions and ceremonies. Batik Megamendung reflects the artistic heritage of Cirebon and remains a symbol of cultural pride for the region.';
    } else if (predictedLabel === "batik-minang") {
      origin =
        "Batik Minang is a traditional batik style originating from the Minangkabau ethnic group of West Sumatra, Indonesia.";
      description =
        "Batik Minang is characterized by its motifs inspired by the rich cultural heritage and natural surroundings of the Minangkabau region. The motifs often feature geometric patterns, stylized flora and fauna, and motifs inspired by traditional Minangkabau architecture and symbols. Batik Minang reflects the values and beliefs of the Minangkabau people, such as harmony with nature, community spirit, and respect for tradition. This style of batik is highly valued for its intricate detailing, fine craftsmanship, and cultural significance, making it a cherished textile among the Minangkabau community.";
    } else if (predictedLabel === "batik-pala") {
      origin =
        "Batik Pala is a traditional batik style originating from Pekalongan, a regency in Central Java, Indonesia.";
      description =
        'Batik Pala is characterized by its motifs inspired by the nutmeg fruit, known as "pala" in Indonesian. The motifs often feature intricate patterns resembling the shape and texture of nutmeg, as well as motifs inspired by the plants leaves and flowers. Batik Pala reflects the cultural heritage and historical significance of nutmeg in the region, which was once a major center of nutmeg cultivation and trade. This style of batik is valued for its artistic complexity, fine craftsmanship, and connection to local traditions, making it a symbol of pride and identity for the people of Pekalongan.';
    } else if (predictedLabel === "batik-parang") {
      origin =
        "Batik Parang is a traditional batik motif originating from Central Java, Indonesia.";
      description =
        'Batik Parang is characterized by its distinctive motif, which resembles interconnected diagonal lines forming a series of "waves" or "mountains." The motif symbolizes harmony, continuity, and protection, and it holds cultural significance in Javanese society. Batik Parang is often associated with nobility and is traditionally worn during special occasions, such as weddings and ceremonial events. This style of batik requires precision and skill in the wax-resist dyeing process to achieve the intricate pattern. Batik Parang remains a timeless symbol of Javanese culture and heritage, cherished for its elegance and symbolism.';
    } else if (predictedLabel === "batik-pekalongan") {
      origin =
        "Batik Pekalongan is a traditional batik style originating from Pekalongan, a regency in Central Java, Indonesia.";
      description =
        "Batik Pekalongan is known for its vibrant colors, intricate motifs, and rich cultural symbolism. The motifs in Batik Pekalongan often draw inspiration from nature, mythology, and local customs. This style of batik is characterized by its use of multiple colors and elaborate patterns, which are meticulously hand-drawn or stamped onto the fabric using wax-resist techniques. Batik Pekalongan reflects the artistic traditions and heritage of Pekalongan, a region renowned for its batik production since the colonial era. This style of batik is highly valued for its fine craftsmanship, artistic beauty, and cultural significance, making it a cherished textile among collectors and enthusiasts worldwide.";
    } else if (predictedLabel === "batik-poleng") {
      origin =
        "Batik Poleng is a traditional batik motif originating from Bali, Indonesia.";
      description =
        "Batik Poleng is characterized by its distinctive black and white checkered pattern, which symbolizes the balance between opposing forces, such as good and evil, light and dark, or positive and negative energies. The motif is often arranged in a grid-like formation, creating a visually striking contrast between the black and white squares. Batik Poleng holds deep cultural and spiritual significance in Balinese society, and it is commonly used in ceremonies, rituals, and religious offerings. This style of batik serves as a visual representation of the concept of balance and harmony, which is central to Balinese philosophy and worldview.";
    } else if (predictedLabel === "batik-priangan") {
      origin =
        "Batik Priangan is a traditional batik style originating from the Priangan region, which encompasses several regencies in West Java, Indonesia, including Bandung and its surrounding areas.";
      description =
        "Batik Priangan is characterized by its rich motifs inspired by the cultural heritage and natural surroundings of the Priangan region. The motifs often feature geometric patterns, stylized flora and fauna, and motifs inspired by traditional Priangan architecture and symbols. Batik Priangan reflects the values and beliefs of the Sundanese people, such as a strong connection to nature, community spirit, and respect for tradition. This style of batik is highly valued for its intricate detailing, fine craftsmanship, and cultural significance, making it a cherished textile among the Sundanese community.";
    } else if (predictedLabel === "batik-sekar-jagad") {
      origin =
        "Batik Sekar Jagad is a traditional batik style originating from Yogyakarta and Surakarta (Solo), two cultural centers in Central Java, Indonesia.";
      description =
        'Batik Sekar Jagad, which translates to "flower of the universe," is characterized by its intricate floral motifs that are arranged in a repeating pattern across the fabric. These motifs often feature delicate floral designs inspired by the natural beauty of Java, along with geometric elements representing the interconnectedness of all things in the universe. Batik Sekar Jagad reflects the Javanese philosophy of harmony and balance, as well as the belief in the cosmic order. This style of batik is highly valued for its artistic beauty, fine craftsmanship, and cultural significance, making it a symbol of Javanese heritage and tradition.';
    } else if (predictedLabel === "batik-sidoluhur") {
      origin =
        "Batik Sidoluhur is a traditional batik style originating from Banyumas, a regency in Central Java, Indonesia.";
      description =
        "Batik Sidoluhur is characterized by its motifs inspired by the cultural heritage and natural surroundings of Banyumas. The motifs often feature intricate patterns resembling traditional Banyumas architecture, local flora and fauna, and symbols representing the regions rich history and traditions. Batik Sidoluhur reflects the values and beliefs of the Banyumas community, such as harmony with nature, community spirit, and respect for tradition. This style of batik is highly valued for its artistic complexity, fine craftsmanship, and connection to local traditions, making it a symbol of pride and identity for the people of Banyumas.";
    } else if (predictedLabel === "batik-sidomukti") {
      origin =
        "Batik Sidomukti is a traditional batik style originating from Pekalongan, a regency in Central Java, Indonesia.";
      description =
        "Batik Sidomukti is characterized by its motifs inspired by the local cultural heritage and natural landscape of Pekalongan. The motifs often feature intricate patterns resembling traditional Pekalongan architecture, local flora and fauna, and symbols representing the regions history and traditions. Batik Sidomukti reflects the values and beliefs of the Pekalongan community, such as harmony with nature, community spirit, and respect for tradition. This style of batik is highly valued for its artistic complexity, fine craftsmanship, and connection to local traditions, making it a symbol of pride and identity for the people of Pekalongan.";
    } else if (predictedLabel === "batik-sogan") {
      origin =
        "Batik Sogan is a traditional batik style originating from Solo (Surakarta), a cultural center in Central Java, Indonesia.";
      description =
        "Batik Sogan is characterized by its distinctive brown color, which is derived from natural dyes, particularly from the Soga tree (Peltophorum pterocarpum). The motifs in Batik Sogan often feature intricate patterns inspired by Javanese cultural symbols, such as wayang (shadow puppet) figures, traditional motifs, and geometric designs. Batik Sogan holds cultural significance as it was historically worn by members of the royal courts and aristocrats in Java. This style of batik reflects the refined taste and elegance of Javanese culture and remains popular for its classic aesthetic and cultural heritage.";
    } else if (predictedLabel === "batik-tambal") {
      origin =
        "Batik Tambal is a traditional batik style originating from Cirebon, a regency in West Java, Indonesia.";
      description =
        "Batik Tambal is characterized by its distinctive patchwork-like appearance, created by combining various small motifs and patterns on the fabric. These motifs are arranged in a patchwork fashion, resembling the patchwork technique used in quilting. Batik Tambal often features a mix of geometric designs, floral motifs, and cultural symbols, reflecting the rich cultural heritage of Cirebon. This style of batik showcases the creativity and skill of the artisans who meticulously arrange the motifs to create a harmonious and visually appealing composition. Batik Tambal is valued for its artistic complexity, fine craftsmanship, and unique aesthetic, making it a cherished textile among collectors and enthusiasts.";
    } else if (predictedLabel === "batik-tifa") {
      origin =
        "Batik Tifa (Batik Papua) Papua is a traditional batik style originating from Papua Province, Indonesia, particularly among the indigenous Papuan tribes.";
      description =
        "Batik Tifa/Papua is characterized by its unique motifs inspired by the rich cultural heritage and natural surroundings of Papua. The motifs often feature geometric patterns, stylized flora and fauna, and symbols representing traditional Papuan beliefs, rituals, and customs. Batik Tifa/Papua reflects the values and traditions of the Papuan tribes, such as a strong connection to nature, spirituality, and community. This style of batik is highly valued for its intricate detailing, fine craftsmanship, and cultural significance, serving as a symbol of Papuan identity and heritage.";
    }

    // Simpan gambar ke Google Cloud Storage
    const fileName = `predicted_images/${predictedLabel}.png`;
    const file = storage.bucket("process.env.PREDICT_BUCKET").file(fileName);
    await file.save(processedImage);

    const fileUrl = `https://storage.googleapis.com/process.env.PREDICT_BUCKET/${fileName}`;

    // Informasi tambahan
    const result = {
      nama: predictedLabel,
      createdAt: timestamp,
      origin,
      description,
    };

    // Simpan log ke Firestore
    const logEntry = {
      imageUrl: fileUrl,
      createdAt: timestamp,
      predictedLabel,
      origin,
    };

    await firestore.collection("Log_Predict").add(logEntry);

    return h.response(result);
  } catch (error) {
    console.error("Prediction error:", error);
    return h.response({ error: "Prediction error" }).code(500);
  }
};

module.exports = { predictBatik };