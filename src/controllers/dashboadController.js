const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Category = require('../models/category');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get total budget amount
    const budgets = await Budget.findAll({
      where: { userId },
      attributes: ['totalAmount']
    });
    const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.totalAmount), 0);

    // Get current month transactions
    const transactions = await Transaction.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name', 'color', 'icon']
        }
      ],
      order: [['date', 'DESC']]
    });

    // Calculate totals
    let totalSpent = 0;
    let totalIncome = 0;
    
    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'expense') {
        totalSpent += amount;
      } else {
        totalIncome += amount;
      }
    });

    // Calculate remaining (budget - spent)
    const remaining = totalBudget - totalSpent;

    // Get recent transactions (last 5)
    const recentTransactions = transactions.slice(0, 5);

    const dashboardStats = {
      totalBudget,
      totalSpent,
      totalIncome,
      remaining,
      transactionCount: transactions.length,
      recentTransactions
    };

    res.json({
      success: true,
      data: dashboardStats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  getDashboardStats
};