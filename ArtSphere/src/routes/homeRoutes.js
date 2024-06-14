const homController = require('../controllers/homeController');
const verifyToken = require('../middleware/verifyToken'); // Import middleware

module.exports = [
    {
        method: 'POST',
        path: '/add-feeds',
        options: {
            handler: homController.addFeed,
            pre: [verifyToken], // Gunakan middleware verifyToken sebelum handler addFeed
            payload: {
                multipart: true,
                maxBytes: 1048576 * 100, // 1MB
                output: 'stream',
                parse: true
            }
        }
    },
    {
        method: 'GET',
        path: '/get-feeds',
        options: {
            handler: homController.getFeeds,
            pre: [verifyToken] // Gunakan middleware verifyToken sebelum handler getFeeds
        }
    },
    {
        method: 'GET',
        path: '/feeds/{id}',
        options: {
            handler: homController.getFeedById,
            pre: [verifyToken] // Gunakan middleware verifyToken sebelum handler getFeedById
        }
    }
];
