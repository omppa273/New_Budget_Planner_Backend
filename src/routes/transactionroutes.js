const express = require('express');
const router = express.Router();
const { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction 
} = require('../controllers/transactioncontroller');
const { authenticateToken } = require('../middleware/auth');

// All transaction routes require authentication
router.use(authenticateToken);

// Transaction routes
router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;