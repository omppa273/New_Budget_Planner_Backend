const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  addContribution,
  getGoalSuggestions,
  deleteGoal
} = require('../controllers/goalController');
const { authenticateToken } = require('../middleware/auth');

// All goal routes require authentication
router.use(authenticateToken);

// Goal routes
router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

// Goal contribution routes
router.post('/:id/contribute', addContribution);

// Goal suggestions
router.get('/suggestions', getGoalSuggestions);

module.exports = router;