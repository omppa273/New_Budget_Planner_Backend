const Budget = require('../models/Budget');
const Category = require('../models/category');

// Get all budgets for user
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { budgets }
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets'
    });
  }
};

// Create new budget
const createBudget = async (req, res) => {
  try {
    const { name, totalAmount, period = 'monthly' } = req.body;
    
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const budget = await Budget.create({
      name,
      totalAmount,
      period,
      startDate,
      endDate,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: { budget }
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create budget'
    });
  }
};

// Get categories - ADD THIS FUNCTION
const getCategories = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    
    const categories = await Category.findAll({
      where: {
        [Op.or]: [
          { userId: req.user.id },
          { userId: null } // Default categories
        ]
      },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  getCategories  // ADD THIS
};