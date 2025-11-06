const Goal = require('../models/Goal');
const GoalContribution = require('../models/GoalContribution');
const { Op } = require('sequelize');

// Get all goals for user
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: GoalContribution,
          as: 'contributions',
          order: [['contributionDate', 'DESC']],
          limit: 5
        }
      ],
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });

    // Add calculated fields
    const goalsWithProgress = goals.map(goal => {
      const goalJson = goal.toJSON();
      return {
        ...goalJson,
        progressPercentage: goal.getProgressPercentage(),
        remainingAmount: goal.getRemainingAmount(),
        daysRemaining: goal.getDaysRemaining(),
        requiredMonthlySavings: goal.getRequiredMonthlySavings()
      };
    });

    res.json({
      success: true,
      data: { goals: goalsWithProgress }
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals'
    });
  }
};

// Create new goal
const createGoal = async (req, res) => {
  try {
    const {
      name,
      description,
      targetAmount,
      category,
      priority,
      deadline,
      autoContribute,
      monthlyContribution
    } = req.body;

    const goal = await Goal.create({
      name,
      description,
      targetAmount,
      category,
      priority,
      deadline,
      autoContribute,
      monthlyContribution: autoContribute ? monthlyContribution : 0,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: { goal }
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create goal'
    });
  }
};

// Update goal
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const goal = await Goal.findOne({
      where: { id, userId: req.user.id }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await goal.update(updateData);

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: { goal }
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal'
    });
  }
};

// Add contribution to goal
const addContribution = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;

    const goal = await Goal.findOne({
      where: { id, userId: req.user.id }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Create contribution
    const contribution = await GoalContribution.create({
      amount,
      description,
      goalId: id,
      userId: req.user.id,
      type: 'manual'
    });

    // Update goal current amount
    const newCurrentAmount = parseFloat(goal.currentAmount) + parseFloat(amount);
    await goal.update({
      currentAmount: newCurrentAmount,
      lastContribution: new Date()
    });

    // Check if goal is completed
    if (newCurrentAmount >= goal.targetAmount) {
      await goal.update({ status: 'completed' });
    }

    res.json({
      success: true,
      message: 'Contribution added successfully',
      data: { contribution, goal }
    });
  } catch (error) {
    console.error('Add contribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add contribution'
    });
  }
};

// Get goal suggestions
const getGoalSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's spending patterns for suggestions
    const suggestions = [
      {
        category: 'emergency_fund',
        name: 'Emergency Fund',
        description: 'Build 3-6 months of expenses for unexpected situations',
        suggestedAmount: 5000,
        priority: 'high',
        icon: '🛡️'
      },
      {
        category: 'vacation',
        name: 'Dream Vacation',
        description: 'Save for that special trip you\'ve been planning',
        suggestedAmount: 3000,
        priority: 'medium',
        icon: '✈️'
      },
      {
        category: 'house_down_payment',
        name: 'House Down Payment',
        description: 'Save for your future home down payment',
        suggestedAmount: 50000,
        priority: 'high',
        icon: '🏠'
      },
      {
        category: 'car_purchase',
        name: 'New Car',
        description: 'Save for a reliable vehicle',
        suggestedAmount: 15000,
        priority: 'medium',
        icon: '🚗'
      }
    ];

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions'
    });
  }
};

// Delete goal
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOne({
      where: { id, userId: req.user.id }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Delete all contributions first
    await GoalContribution.destroy({
      where: { goalId: id }
    });

    // Delete goal
    await goal.destroy();

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal'
    });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  addContribution,
  getGoalSuggestions,
  deleteGoal
};