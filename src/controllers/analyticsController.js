const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Category = require('../models/category');
const { Op } = require('sequelize');

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    // Set default date range (current month if not provided)
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Get transactions within date range
    const transactions = await Transaction.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [start, end]
        }
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name', 'color', 'icon']
        }
      ],
      order: [['date', 'ASC']]
    });

    // Get budgets for user
    const budgets = await Budget.findAll({
      where: { userId },
      attributes: ['id', 'name', 'totalAmount']
    });

    // Calculate spending trends (daily aggregation)
    const spendingTrends = {};
    transactions.forEach(transaction => {
      const date = transaction.date.toISOString().split('T')[0];
      if (!spendingTrends[date]) {
        spendingTrends[date] = { income: 0, expense: 0 };
      }
      const amount = parseFloat(transaction.amount);
      spendingTrends[date][transaction.type] += amount;
    });

    const spendingTrendsArray = Object.keys(spendingTrends).map(date => ({
      date,
      income: spendingTrends[date].income,
      expense: spendingTrends[date].expense
    }));

    // Calculate category breakdown
    const categoryBreakdown = {};
    let totalExpenses = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const amount = parseFloat(transaction.amount);
        totalExpenses += amount;
        
        const categoryName = transaction.category?.name || 'Uncategorized';
        const categoryColor = transaction.category?.color || '#666';
        
        if (!categoryBreakdown[categoryName]) {
          categoryBreakdown[categoryName] = {
            categoryName,
            amount: 0,
            color: categoryColor
          };
        }
        categoryBreakdown[categoryName].amount += amount;
      }
    });

    // Convert to array and add percentages
    const categoryBreakdownArray = Object.values(categoryBreakdown).map(category => ({
      ...category,
      percentage: totalExpenses > 0 ? (category.amount / totalExpenses * 100) : 0
    }));

    // Calculate budget analysis
    const budgetAnalysis = await Promise.all(budgets.map(async (budget) => {
      // Get transactions for this budget (if linked) or estimate based on total spending
      const budgetTransactions = await Transaction.findAll({
        where: {
          userId,
          budgetId: budget.id,
          type: 'expense',
          date: {
            [Op.between]: [start, end]
          }
        }
      });

      const spent = budgetTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const budgeted = parseFloat(budget.totalAmount);
      const remaining = budgeted - spent;
      const percentage = budgeted > 0 ? (spent / budgeted * 100) : 0;

      return {
        budgetName: budget.name,
        budgeted,
        spent,
        remaining,
        percentage
      };
    }));

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

    const analyticsData = {
      spendingTrends: spendingTrendsArray,
      categoryBreakdown: categoryBreakdownArray,
      budgetAnalysis,
      totalIncome,
      totalExpenses,
      savingsRate
    };

    res.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
};

module.exports = {
  getAnalytics
};