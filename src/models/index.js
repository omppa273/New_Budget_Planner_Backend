const { sequelize } = require('../config/database');
const User = require('./User');
const Budget = require('./Budget');
const Category = require('./category');
const Transaction = require('./Transaction');
const Goal = require('./Goal');
const GoalContribution = require('./GoalContribution');

// Define associations
User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets' });
Budget.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Category, { foreignKey: 'userId', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(Transaction, { foreignKey: 'categoryId', as: 'transactions' });
Transaction.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Budget.hasMany(Transaction, { foreignKey: 'budgetId', as: 'transactions' });
Transaction.belongsTo(Budget, { foreignKey: 'budgetId', as: 'budget' });

// Goal associations
User.hasMany(Goal, { foreignKey: 'userId', as: 'goals' });
Goal.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Goal.hasMany(GoalContribution, { foreignKey: 'goalId', as: 'contributions' });
GoalContribution.belongsTo(Goal, { foreignKey: 'goalId', as: 'goal' });

User.hasMany(GoalContribution, { foreignKey: 'userId', as: 'goalContributions' });
GoalContribution.belongsTo(User, { foreignKey: 'userId', as: 'user' });

const models = { User, Budget, Category, Transaction, Goal, GoalContribution };

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('✅ Database tables created successfully.');
    
    // Create default categories
    await createDefaultCategories();
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
  }
};

const createDefaultCategories = async () => {
  const defaultCategories = [
    { name: 'Food & Dining', color: '#ff6b6b', icon: 'restaurant', type: 'expense' },
    { name: 'Transportation', color: '#4ecdc4', icon: 'directions_car', type: 'expense' },
    { name: 'Entertainment', color: '#45b7d1', icon: 'movie', type: 'expense' },
    { name: 'Shopping', color: '#f9ca24', icon: 'shopping_cart', type: 'expense' },
    { name: 'Bills & Utilities', color: '#6c5ce7', icon: 'receipt', type: 'expense' },
    { name: 'Healthcare', color: '#a29bfe', icon: 'local_hospital', type: 'expense' },
    { name: 'Salary', color: '#00b894', icon: 'attach_money', type: 'income' },
    { name: 'Freelance', color: '#00cec9', icon: 'work', type: 'income' }
  ];

  for (const category of defaultCategories) {
    await Category.findOrCreate({
      where: { name: category.name, userId: null },
      defaults: category
    });
  }
};

module.exports = { sequelize, syncDatabase, User, Budget, Category, Transaction, Goal, GoalContribution };