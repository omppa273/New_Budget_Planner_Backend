const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3f51b5'
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: 'category'
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    defaultValue: 'expense'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // null for default categories
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'categories'
});

module.exports = Category;