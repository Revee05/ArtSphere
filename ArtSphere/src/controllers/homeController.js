const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { firestore } = require('../config/firestore');
const { storage } = require('../config/gcs');


const addFeed = async (request, h) => {
  try {
      const { media, description } = request.payload;

      // Validate payload
      const schema = Joi.object({
          media: Joi.object().required(),
          description: Joi.string().required(),
      });

      const { error } = schema.validate({ media, description });
      if (error) {
          throw new Error(error.details[0].message);
      }

      // Handle file upload
      const file = media._data;
      if (!file) {
          throw new Error('No file uploaded');
      }

      const filename = uuidv4() + '-' + media.hapi.filename;
      const fileUpload = storage.bucket(process.env.FEEDS_STORAGE_BUCKET).file(filename);

      // Upload the file to GCS using the stream
      await new Promise((resolve, reject) => {
          const stream = fileUpload.createWriteStream({
              metadata: {
                  contentType: media.hapi.headers['content-type'] // Set content type based on file type
              }
          });
          stream.on('error', (err) => {
              reject(err);
          });
          stream.on('finish', () => {
              resolve();
          });
          stream.end(file);
      });

      // Save metadata to Firestore
      const mediaUrl = `https://storage.googleapis.com/${process.env.FEEDS_STORAGE_BUCKET}/${filename}`;
      const feedData = {
          description,
          mediaUrl,
          createdAt: new Date().toISOString()
      };

      const docRef = await firestore.collection('feeds').add(feedData);

      return {
          error: false,
          message: 'Feed added successfully',
          id: docRef.id
      };
  } catch (err) {
      console.error('Error adding feed:', err);
      return {
          error: true,
          message: err.message || 'Failed to add feed'
      };
  }
};

const getFeeds = async (request, h) => {
  try {
      // Implement logic to fetch feeds from Firestore
      const feedsRef = firestore.collection('feeds');
      const snapshot = await feedsRef.get();

      if (snapshot.empty) {
          return {
              error: true,
              message: 'No feeds found'
          };
      }

      const feeds = [];
      snapshot.forEach(doc => {
          feeds.push({
              id: doc.id,
              ...doc.data()
          });
      });

      // Shuffle the feeds array using Fisher-Yates (Knuth) Shuffle
      for (let i = feeds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [feeds[i], feeds[j]] = [feeds[j], feeds[i]];
      }

      return {
          error: false,
          message: 'Feeds fetched successfully',
          feeds
      };
  } catch (err) {
      console.error('Error getting feeds:', err);
      return {
          error: true,
          message: err.message || 'Failed to fetch feeds'
      };
  }
};


const getFeedById = async (request, h) => {
    try {
        const { id } = request.params;

        // Fetch feed from Firestore by ID
        const docRef = await firestore.collection('feeds').doc(id).get();
        if (!docRef.exists) {
            return {
                error: true,
                message: 'Feed not found'
            };
        }

        const feedData = docRef.data();
        return {
            error: false,
            message: 'Feed fetched successfully',
            feed: {
                id: docRef.id,
                ...feedData
            }
        };
    } catch (err) {
        console.error('Error getting feed by ID:', err);
        return {
            error: true,
            message: err.message || 'Failed to fetch feed'
        };
    }
};

module.exports = {
    addFeed,
    getFeeds,
    getFeedById
};
