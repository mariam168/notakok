const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', auth, dashboardController.getStats);

module.exports = router;