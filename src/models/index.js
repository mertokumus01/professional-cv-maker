const { Sequelize } = require('sequelize');
const path = require('path');
const config = require('../../config/database');
const logger = require('../server/utils/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    ssl: dbConfig.ssl,
  }
);

// Load models
const User = require('./User')(sequelize);
const CV = require('./CV')(sequelize);

// Define associations
User.hasMany(CV, {
  foreignKey: 'userId',
  as: 'cvs',
  onDelete: 'CASCADE',
});

CV.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Export
module.exports = {
  sequelize,
  User,
  CV,
};
