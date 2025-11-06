const Transaction = require('../models/Transaction');
const Category = require('../models/category');
const Budget = require('../models/Budget');

// Get all transactions for user
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (type && (type === 'income' || type === 'expense')) {
      whereClause.type = type;
    }

    const transactions = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color', 'icon']
        },
        {
          model: Budget,
          as: 'budget',
          attributes: ['id', 'name']
        }
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        transactions: transactions.rows,
        totalCount: transactions.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(transactions.count / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

// Create new transaction
const createTransaction = async (req, res) => {
  try {
    const { amount, description, type, date, categoryId, budgetId } = req.body;

    const transaction = await Transaction.create({
      amount,
      description,
      type,
      date: date || new Date(),
      categoryId,
      budgetId,
      userId: req.user.id
    });

    // Fetch the created transaction with associations
    const newTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color', 'icon']
        },
        {
          model: Budget,
          as: 'budget',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction: newTransaction }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, type, date, categoryId, budgetId } = req.body;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.update({
      amount,
      description,
      type,
      date,
      categoryId,
      budgetId
    });

    // Fetch updated transaction with associations
    const updatedTransaction = await Transaction.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color', 'icon']
        },
        {
          model: Budget,
          as: 'budget',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction: updatedTransaction }
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction'
    });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.destroy();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction'
    });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};