const express = require('express');
const router = express.Router();
const dashController = require('../controllers/dashboardController');

router.get('/stats', dashController.getDashboardStats);

module.exports = router;
