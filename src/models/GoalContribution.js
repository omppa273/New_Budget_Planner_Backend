const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GoalContribution = sequelize.define('GoalContribution', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contributionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  type: {
    type: DataTypes.ENUM('manual', 'automatic', 'milestone'),
    defaultValue: 'manual'
  },
  goalId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'goals',
      key: 'id'
    }
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
  tableName: 'goal_contributions'
});

module.exports = GoalContribution;