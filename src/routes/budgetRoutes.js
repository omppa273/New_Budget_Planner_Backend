const express = require('express');
const router = express.Router();
const { getBudgets, createBudget, getCategories } = require('../controllers/budgetController');
const { authenticateToken } = require('../middleware/auth');

// All budget routes require authentication
router.use(authenticateToken);

// Budget routes
router.get('/', getBudgets);
router.post('/', createBudget);

// Category routes - ADD THIS
router.get('/categories', getCategories);

module.exports = router;