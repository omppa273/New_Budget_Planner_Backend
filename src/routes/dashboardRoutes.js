const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboadController');
const { authenticateToken } = require('../middleware/auth');

// Dashboard routes require authentication
router.use(authenticateToken);

router.get('/', getDashboardStats);

module.exports = router;