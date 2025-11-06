const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Goal = sequelize.define('Goal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  targetAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  currentAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  category: {
    type: DataTypes.ENUM(
      'emergency_fund',
      'vacation',
      'debt_payoff',
      'house_down_payment',
      'car_purchase',
      'education',
      'retirement',
      'investment',
      'other'
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'completed', 'cancelled'),
    defaultValue: 'active'
  },
  autoContribute: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  monthlyContribution: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  lastContribution: {
    type: DataTypes.DATE,
    allowNull: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'goals'
});

// Virtual fields for calculations
Goal.prototype.getProgressPercentage = function() {
  return this.targetAmount > 0 ? (this.currentAmount / this.targetAmount * 100) : 0;
};

Goal.prototype.getRemainingAmount = function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
};

Goal.prototype.getDaysRemaining = function() {
  if (!this.deadline) return null;
  const today = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

Goal.prototype.getRequiredMonthlySavings = function() {
  const daysRemaining = this.getDaysRemaining();
  if (!daysRemaining || daysRemaining <= 0) return 0;
  
  const monthsRemaining = daysRemaining / 30;
  const remainingAmount = this.getRemainingAmount();
  return monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount;
};

module.exports = Goal;