const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  period: {
    type: DataTypes.ENUM('monthly', 'yearly', 'custom'),
    defaultValue: 'monthly'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true  // Changed to true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true  // Changed to true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'budgets'
});

module.exports = Budget;